import { pdfjs } from 'react-pdf';

// Simple text decoder for non-image base64 content
function decodeBase64ToText(base64Data) {
  try {
    return atob(base64Data);
  } catch (error) {
    console.error("Error decoding base64 to text:", error);
    return "[Unable to decode text document]";
  }
}

// Client-side text extraction from PDF base64 using PDF.js
async function extractTextFromPdf(base64Data) {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Make sure worker is configured (reuse the same CDN worker used in app pages)
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    const pdf = await pdfjs.getDocument({ data: byteArray }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += `[Page ${i}]\n${pageText}\n\n`;
      } catch (pageErr) {
        console.error(`Error parsing page ${i} of PDF:`, pageErr);
        fullText += `[Page ${i} - Error parsing page text]\n\n`;
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF in Groq helper:", error);
    return "[Could not extract text content from PDF document]";
  }
}

/**
 * Generates a response using the Groq API as a fallback when Gemini fails.
 * 
 * @param {object} params
 * @param {string} params.systemInstruction - Custom system instructions for the LLM
 * @param {array} params.history - Array of existing chat messages { role: 'user'|'assistant'|'model', content: string }
 * @param {string} params.prompt - Current prompt message from the user
 * @param {array} params.files - List of active documents { name, type, mimeType, base64 }
 * @param {boolean} params.isJSON - True if we need a structured JSON response (e.g. for study sets/quizzes)
 * @returns {Promise<string>} Responded content from the Groq API
 */
export async function generateGroqResponse({
  systemInstruction,
  history = [],
  prompt,
  files = [],
  isJSON = false
}) {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Groq API Key. Please ensure NEXT_PUBLIC_GROQ_API_KEY is configured in your .env file.");
  }

  // Check if we have image documents
  const images = files.filter(f => f.type === 'img' || (f.mimeType && f.mimeType.startsWith('image/')));
  const nonImages = files.filter(f => f.type !== 'img' && (!f.mimeType || !f.mimeType.startsWith('image/')));

  // Use vision-ready model if images are present, otherwise llama-3.3-70b-versatile
  const model = images.length > 0 ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

  // Extract text from text/pdf documents to supply as direct grounding context
  let docContext = "";
  for (const file of nonImages) {
    if (file.base64) {
      if (file.type === 'pdf' || file.name.endsWith('.pdf')) {
        const pdfText = await extractTextFromPdf(file.base64);
        docContext += `\n\n--- Document Context: ${file.name} ---\n${pdfText}\n------------------------\n`;
      } else {
        const decodedText = decodeBase64ToText(file.base64);
        docContext += `\n\n--- Document Context: ${file.name} ---\n${decodedText}\n------------------------\n`;
      }
    }
  }

  // Construct standard message format for Groq API (OpenAI compatible)
  const groqMessages = [];

  if (systemInstruction) {
    groqMessages.push({ role: "system", content: systemInstruction });
  }

  // Include prior message history
  for (const msg of history) {
    // Standardize 'model' role to 'assistant'
    const role = msg.role === 'model' ? 'assistant' : msg.role;
    groqMessages.push({ role, content: msg.content });
  }

  // Construct current user content block (could be text + images)
  const userContent = [];

  // Ground the prompt using the document context if available
  let finalPromptText = prompt;
  if (docContext) {
    finalPromptText = `You are analyzing the following documents:\n${docContext}\n\nUse the document context above to fulfill this prompt:\n${prompt}`;
  }
  userContent.push({ type: "text", text: finalPromptText });

  // Attach base64 images if present
  for (const img of images) {
    if (img.base64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${img.mimeType || 'image/jpeg'};base64,${img.base64}`
        }
      });
    }
  }

  groqMessages.push({
    role: "user",
    content: userContent.length === 1 ? userContent[0].text : userContent
  });

  // Prepare standard Groq request payload
  const requestBody = {
    model: model,
    messages: groqMessages,
    temperature: 0.2, // Low temperature for high fidelity/accuracy in study materials
  };

  // Enable forced JSON output if requested
  if (isJSON) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errorDetails}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error("Empty response received from Groq API.");
  }

  return data.choices[0].message.content;
}
