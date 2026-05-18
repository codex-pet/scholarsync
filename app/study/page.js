"use client";
import { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadFilesLocally, loadStudySetsLocally, saveStudySetLocally, deleteStudySetLocally } from "../../lib/indexeddb";
import { Flame, Target, TrendingUp, BookOpen, Zap, Loader2, FileText, CheckCircle, XCircle, ChevronRight, ChevronLeft, ArrowLeft, RefreshCw, LibraryBig, Shuffle, ThumbsUp, ThumbsDown, Trash2, Search, SlidersHorizontal, Award, RotateCcw } from "lucide-react";

// Shuffle array (Fisher-Yates)
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Get current streak from localStorage
const getStreak = () => {
  try {
    const data = JSON.parse(localStorage.getItem('ss_streak') || '{"count":0,"lastDate":""}');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === today) return data.count;
    if (data.lastDate === yesterday) {
      const updated = { count: data.count + 1, lastDate: today };
      localStorage.setItem('ss_streak', JSON.stringify(updated));
      return updated.count;
    }
    const reset = { count: 1, lastDate: today };
    localStorage.setItem('ss_streak', JSON.stringify(reset));
    return reset.count;
  } catch { return 0; }
};

export default function StudyCenter() {
  const [files, setFiles] = useState([]);
  const [studySets, setStudySets] = useState({});
  const [isGenerating, setIsGenerating] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [streak] = useState(() => typeof window !== 'undefined' ? getStreak() : 0);

  // Search & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'mastery' | 'date'

  // Flashcard states
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [knownCards, setKnownCards] = useState(new Set());

  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);

  // Confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const localFiles = await loadFilesLocally();
        const localSets = await loadStudySetsLocally();
        const setsMap = {};
        localSets.forEach(s => { setsMap[s.fileId] = s; });
        setFiles(localFiles);
        setStudySets(setsMap);
      } catch (err) { console.error("Error loading data from DB", err); }
    }
    loadData();
  }, []);

  const totalFlashcards = files.reduce((acc, f) => acc + (studySets[f.id]?.flashcards?.length || 0), 0);
  const totalQuizzes = files.reduce((acc, f) => acc + (studySets[f.id]?.quiz?.length || 0), 0);
  const avgMastery = (() => {
    const validSets = files.map(f => studySets[f.id]).filter(s => s && s.mastery !== undefined);
    if (!validSets.length) return null;
    return Math.round(validSets.reduce((a, s) => a + s.mastery, 0) / validSets.length);
  })();

  // Filtered + sorted files
  const displayedFiles = files
    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'mastery') return (studySets[b.id]?.mastery || 0) - (studySets[a.id]?.mastery || 0);
      if (sortBy === 'date') return (studySets[b.id]?.createdAt || 0) - (studySets[a.id]?.createdAt || 0);
      return a.name.localeCompare(b.name);
    });

  const generateStudySet = async (file) => {
    setIsGenerating(file.id);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing Gemini API Key");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an expert educator. Based ONLY on the provided document, generate a study set.
      Return STRICTLY a raw JSON object with this exact structure:
      {
        "flashcards": [
          { "q": "Question text", "a": "Answer text" }
        ],
        "quiz": [
          { "question": "Question text", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }
        ]
      }
      Generate exactly 10 flashcards and 5 quiz questions. Do not include markdown formatting like \`\`\`json. Return only the JSON string.`;

      const parts = [{ text: prompt }];
      if (file.base64) {
        parts.push({ inlineData: { data: file.base64, mimeType: file.mimeType } });
      }

      const result = await model.generateContent(parts);
      let responseText = result.response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not find a valid JSON object in the AI response.");
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      const newSet = {
        fileId: file.id,
        fileName: file.name,
        flashcards: parsedData.flashcards,
        quiz: parsedData.quiz,
        createdAt: Date.now()
      };

      await saveStudySetLocally(newSet);
      setStudySets(prev => ({ ...prev, [file.id]: newSet }));

    } catch (err) {
      console.error("Failed to generate study set", err);
      alert(`Generation failed: ${err.message}\n\nPlease check your API key and file format.`);
    } finally {
      setIsGenerating(null);
    }
  };

  const extendStudySet = async (file, existingSet) => {
    setIsGenerating(file.id);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing Gemini API Key");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an expert educator. Based ONLY on the provided document, generate a study set.
      Generate exactly 10 NEW flashcards and 5 NEW quiz questions. Focus on different parts of the document and deeper details. DO NOT repeat concepts.
      Return STRICTLY a raw JSON object with this exact structure:
      {
        "flashcards": [
          { "q": "Question text", "a": "Answer text" }
        ],
        "quiz": [
          { "question": "Question text", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }
        ]
      }
      Do not include markdown formatting like \`\`\`json. Return only the JSON string.`;

      const parts = [{ text: prompt }];
      if (file.base64) {
        parts.push({ inlineData: { data: file.base64, mimeType: file.mimeType } });
      }

      const result = await model.generateContent(parts);
      let responseText = result.response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not find a valid JSON object in the AI response.");
      }
      const parsedData = JSON.parse(jsonMatch[0]);
      
      const newSet = {
        ...existingSet,
        flashcards: [...(existingSet.flashcards || []), ...parsedData.flashcards],
        quiz: [...(existingSet.quiz || []), ...parsedData.quiz]
      };

      await saveStudySetLocally(newSet);
      setStudySets(prev => ({ ...prev, [file.id]: newSet }));

    } catch (err) {
      console.error("Failed to extend study set", err);
      alert(`Extension failed: ${err.message}\n\nPlease check your API key and file format.`);
    } finally {
      setIsGenerating(null);
    }
  };

  const refreshStudySet = async (fileId) => {
    const existingSet = studySets[fileId];
    if (!existingSet) return;
    
    const newSet = {
      ...existingSet,
      flashcards: existingSet.flashcards.slice(0, 10),
      quiz: existingSet.quiz.slice(0, 5)
    };

    try {
      await saveStudySetLocally(newSet);
      setStudySets(prev => ({ ...prev, [fileId]: newSet }));
    } catch (err) {
      console.error("Failed to refresh study set", err);
    }
  };

  const startFlashcards = (setId) => {
    const cards = studySets[setId].flashcards;
    setShuffledCards(cards);
    setIsShuffled(false);
    setKnownCards(new Set());
    setActiveSession({ type: 'flashcards', data: studySets[setId] });
    setCardIndex(0);
    setIsFlipped(false);
  };

  const startQuiz = (setId) => {
    setActiveSession({ type: 'quiz', data: studySets[setId] });
    setQuizIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
    setWrongAnswers([]);
    setReviewMode(false);
  };

  const endSession = () => { setActiveSession(null); };

  const deleteStudySet = async (fileId) => {
    try {
      await deleteStudySetLocally(fileId);
      setStudySets(prev => { const n = { ...prev }; delete n[fileId]; return n; });
    } catch (e) { console.error(e); }
    setConfirmDeleteId(null);
  };

  const toggleShuffle = () => {
    if (!isShuffled) {
      setShuffledCards(shuffle(activeSession.data.flashcards));
    } else {
      setShuffledCards(activeSession.data.flashcards);
    }
    setIsShuffled(p => !p);
    setCardIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (activeSession?.type !== 'flashcards') return;
    const cards = isShuffled ? shuffledCards : activeSession.data.flashcards;
    const handler = (e) => {
      if (e.key === 'ArrowRight') { setCardIndex(i => Math.min(cards.length - 1, i + 1)); setIsFlipped(false); }
      if (e.key === 'ArrowLeft')  { setCardIndex(i => Math.max(0, i - 1)); setIsFlipped(false); }
      if (e.key === ' ') { e.preventDefault(); setIsFlipped(f => !f); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSession, isShuffled, shuffledCards]);

  // ----------------------------------------------------
  // FLASHCARDS RENDERER
  // ----------------------------------------------------
  if (activeSession?.type === 'flashcards') {
    const cards = isShuffled ? shuffledCards : activeSession.data.flashcards;
    const currentCard = cards[cardIndex];
    const knownCount = knownCards.size;

    return (
      <div className="p-6 lg:p-10 min-h-screen bg-transparent max-w-[900px] mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={endSession} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors text-sm">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 bg-white/60 px-3 py-1.5 rounded-full border border-slate-100">
              {knownCount} / {cards.length} Known
            </span>
            <button
              onClick={toggleShuffle}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                isShuffled ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/60 text-slate-500 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <Shuffle size={13} /> Shuffle
            </button>
          </div>
        </div>

        {/* Title + Progress */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#2B3674] line-clamp-1">{activeSession.data.fileName}</h2>
          <p className="text-slate-400 text-sm mt-1">Card {cardIndex + 1} of {cards.length} &bull; Press Space to flip, ← → to navigate</p>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((cardIndex + 1) / cards.length) * 100}%` }} />
          </div>
        </div>

        {/* Card */}
        <div onClick={() => setIsFlipped(!isFlipped)} className="w-full aspect-video relative cursor-pointer perspective-1000 group flex-1 max-h-[320px]">
          <div className={`w-full h-full absolute transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            <div className="w-full h-full absolute backface-hidden bg-white/70 backdrop-blur-xl border border-white shadow-xl rounded-[32px] p-8 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Question</p>
              <h3 className="text-xl md:text-2xl font-medium text-slate-800 leading-snug">{currentCard.q}</h3>
              <p className="text-xs text-slate-300 mt-4">Click or press Space to flip</p>
            </div>
            <div className="w-full h-full absolute backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl rounded-[32px] p-8 flex flex-col items-center justify-center text-center rotate-y-180">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4">Answer</p>
              <h3 className="text-lg md:text-xl font-medium text-white leading-relaxed">{currentCard.a}</h3>
            </div>
          </div>
        </div>

        {/* Navigation + Known/Unknown */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <button
            onClick={() => { setCardIndex(Math.max(0, cardIndex - 1)); setIsFlipped(false); }}
            disabled={cardIndex === 0}
            className="p-3 rounded-full bg-white/60 shadow-sm border border-white disabled:opacity-30 hover:bg-white transition-all text-slate-600"
          ><ChevronLeft size={22} /></button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setKnownCards(prev => { const n = new Set(prev); n.delete(cardIndex); return n; }); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                !knownCards.has(cardIndex) ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-white/60 text-slate-400 border-slate-200 hover:border-red-300'
              }`}
            ><ThumbsDown size={14} /> Still Learning</button>
            <button
              onClick={() => { setKnownCards(prev => new Set([...prev, cardIndex])); if (cardIndex < cards.length - 1) { setCardIndex(cardIndex + 1); setIsFlipped(false); } }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                knownCards.has(cardIndex) ? 'bg-green-500 text-white border-green-500 shadow-sm' : 'bg-white/60 text-slate-400 border-slate-200 hover:border-green-300'
              }`}
            ><ThumbsUp size={14} /> Got It!</button>
          </div>

          <button
            onClick={() => { setCardIndex(Math.min(cards.length - 1, cardIndex + 1)); setIsFlipped(false); }}
            disabled={cardIndex === cards.length - 1}
            className="p-3 rounded-full bg-white/60 shadow-sm border border-white disabled:opacity-30 hover:bg-white transition-all text-slate-600"
          ><ChevronRight size={22} /></button>
        </div>

        {/* Completion summary */}
        {knownCount === cards.length && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="font-bold text-green-700">🎉 You've marked all cards as Known!</p>
            <button onClick={endSession} className="mt-2 text-sm font-bold text-green-600 underline">Back to Study Center</button>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // QUIZ RENDERER
  // ----------------------------------------------------
  if (activeSession?.type === 'quiz') {
    const quiz = activeSession.data.quiz;
    const currentQ = quiz[quizIndex];

    const normalizedOptions = currentQ.options.map(opt => {
      return {
        original: opt,
        clean: String(opt).replace(/^\s*[A-D][\.\)]\s*/i, '').trim()
      };
    });

    let resolvedCorrectClean = String(currentQ.correctAnswer).trim();
    if (resolvedCorrectClean.length === 1 && ['A','B','C','D'].includes(resolvedCorrectClean.toUpperCase())) {
      const idx = resolvedCorrectClean.toUpperCase().charCodeAt(0) - 65;
      if (normalizedOptions[idx]) {
        resolvedCorrectClean = normalizedOptions[idx].clean;
      }
    } else {
      resolvedCorrectClean = resolvedCorrectClean.replace(/^\s*[A-D][\.\)]\s*/i, '').trim();
    }

    const checkIsCorrect = (cleanOptText) => {
      if (!cleanOptText || !resolvedCorrectClean) return false;
      if (cleanOptText === resolvedCorrectClean) return true;
      if (cleanOptText.includes(resolvedCorrectClean) || resolvedCorrectClean.includes(cleanOptText)) return true;
      return false;
    };

    const handleAnswer = (cleanOptText) => {
      if (selectedOption !== null) return;
      setSelectedOption(cleanOptText);
      if (checkIsCorrect(cleanOptText)) {
        setScore(s => s + 1);
      } else {
        setWrongAnswers(prev => [...prev, { question: currentQ.question, correct: resolvedCorrectClean, chosen: cleanOptText }]);
      }
    };

    const nextQuestion = () => {
      if (quizIndex === quiz.length - 1) {
        setQuizFinished(true);
        const masteryPercentage = Math.round(((score + (checkIsCorrect(selectedOption) ? 0 : 0)) / quiz.length) * 100);
        const finalScore = score;
        const updatedSet = { ...activeSession.data, mastery: Math.max(activeSession.data.mastery || 0, Math.round((finalScore / quiz.length) * 100)), lastStudied: Date.now() };
        saveStudySetLocally(updatedSet).then(() => setStudySets(prev => ({ ...prev, [activeSession.data.fileId]: updatedSet })));
      } else {
        setQuizIndex(q => q + 1);
        setSelectedOption(null);
      }
    };

    if (quizFinished) {
      const pct = Math.round((score / quiz.length) * 100);
      const passed = pct >= 70;
      return (
        <div className="p-8 lg:p-10 min-h-screen max-w-[700px] mx-auto flex flex-col justify-center">
          <div className="bg-white/60 backdrop-blur-xl border border-white shadow-2xl rounded-[40px] p-8 w-full">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
              {passed ? <Award size={32} className="text-green-600" /> : <Target size={32} className="text-orange-500" />}
            </div>
            <h2 className="text-3xl font-black text-[#2B3674] mb-1 text-center">Quiz Complete!</h2>
            <p className="text-slate-500 text-center mb-6">{score} / {quiz.length} correct &bull; <span className={passed ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>{pct}%</span></p>
            <div className="w-full bg-slate-200 h-3 rounded-full mb-6 overflow-hidden">
              <div className={`h-full ${passed ? 'bg-green-50' : 'bg-orange-50'} transition-all duration-1000 rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            {wrongAnswers.length > 0 && (
              <>
                <button onClick={() => setReviewMode(r => !r)} className="w-full mb-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all">
                  <XCircle size={15} /> Review {wrongAnswers.length} Wrong Answer{wrongAnswers.length > 1 ? 's' : ''}
                </button>
                {reviewMode && (
                  <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                    {wrongAnswers.map((w, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 text-left">
                        <p className="text-sm font-bold text-slate-700 mb-2">{w.question}</p>
                        <p className="text-xs text-red-500"><span className="font-bold">Your answer:</span> {w.chosen}</p>
                        <p className="text-xs text-green-600"><span className="font-bold">Correct:</span> {w.correct}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="flex gap-3">
              <button onClick={() => startQuiz(activeSession.data.fileId)} className="flex-1 py-3 rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all">
                <RotateCcw size={14} /> Retry
              </button>
              <button onClick={endSession} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow transition-all active:scale-95">
                Done
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8 lg:p-12 min-h-screen bg-transparent max-w-[1000px] mx-auto flex flex-col">
        <button onClick={endSession} className="self-start flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-bold transition-colors">
          <ArrowLeft size={20} /> Quit Quiz
        </button>

        <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[40px] p-8 md:p-12 w-full flex-1 flex flex-col">
          <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-6">
            <div>
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Question {quizIndex + 1} of {quiz.length}</p>
              <h2 className="text-2xl md:text-3xl font-medium text-slate-800 leading-snug">{currentQ.question}</h2>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Score</p>
              <p className="text-3xl font-black text-indigo-600">{score}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {normalizedOptions.map((optObj, i) => {
              const cleanOpt = optObj.clean;
              let btnClass = "bg-white/50 border-white text-slate-700 hover:bg-white hover:shadow-md";
              let isThisCorrect = false;
              let isThisSelected = false;
              
              if (selectedOption !== null) {
                isThisCorrect = checkIsCorrect(cleanOpt);
                isThisSelected = cleanOpt === selectedOption;

                if (isThisCorrect) {
                  btnClass = "bg-green-100 border-green-500 text-green-800 shadow-md ring-2 ring-green-500 ring-offset-2";
                } else if (isThisSelected) {
                  btnClass = "bg-red-100 border-red-500 text-red-800 opacity-90";
                } else {
                  btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                }
              }

              return (
                <button 
                  key={i}
                  onClick={() => handleAnswer(cleanOpt)}
                  disabled={selectedOption !== null}
                  className={`p-5 pr-14 rounded-2xl border-2 text-left font-medium text-lg transition-all duration-300 relative flex items-center ${btnClass}`}
                >
                  <div className="flex-1">
                    <span className="inline-block w-8 font-bold opacity-50">{['A','B','C','D'][i]}.</span> {cleanOpt}
                  </div>
                  {isThisCorrect && selectedOption !== null && (
                    <CheckCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-green-600 shrink-0" size={24} />
                  )}
                  {isThisSelected && !isThisCorrect && selectedOption !== null && (
                    <XCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-red-600 shrink-0" size={24} />
                  )}
                </button>
              )
            })}
          </div>

          {selectedOption && (
            <div className="mt-8 flex justify-end">
              <button 
                onClick={nextQuestion}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                {quizIndex === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto min-h-screen flex flex-col">

      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#2B3674] tracking-tight">Study Center</h1>
          <p className="text-slate-500 font-medium mt-1">AI-generated flashcards and quizzes from your library.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-orange-100 to-amber-50 border border-orange-200 px-5 py-2.5 rounded-2xl flex items-center gap-2.5">
            <Flame className="text-orange-500" size={20} />
            <div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none">Streak</p>
              <p className="text-lg font-black text-orange-600 leading-tight">{streak} Day{streak !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {avgMastery !== null && (
            <div className="bg-gradient-to-r from-indigo-100 to-blue-50 border border-indigo-200 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 hidden sm:flex">
              <Award className="text-indigo-500" size={20} />
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Avg Mastery</p>
                <p className="text-lg font-black text-indigo-600 leading-tight">{avgMastery}%</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[28px] flex justify-between items-center relative overflow-hidden shadow-sm">
          <div className="space-y-0.5 z-10">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Saved Materials</p>
            <h2 className="text-4xl font-black text-[#5B61F4]">{files.length}</h2>
          </div>
          <FileText size={44} className="text-[#5B61F4] opacity-10 absolute right-5" strokeWidth={2} />
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[28px] flex justify-between items-center relative overflow-hidden shadow-sm">
          <div className="space-y-0.5 z-10">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Flashcards</p>
            <h2 className="text-4xl font-black text-green-500">{totalFlashcards}</h2>
          </div>
          <BookOpen size={44} className="text-green-500 opacity-10 absolute right-5" strokeWidth={2} />
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[28px] flex justify-between items-center relative overflow-hidden shadow-sm">
          <div className="space-y-0.5 z-10">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Quiz Qs</p>
            <h2 className="text-4xl font-black text-orange-400">{totalQuizzes}</h2>
          </div>
          <Target size={44} className="text-orange-400 opacity-10 absolute right-5" strokeWidth={2} />
        </div>
      </div>

      {/* Study Materials Grid */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-xl font-bold text-[#2B3674] mr-auto">Your Study Sets</h3>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-8 pr-4 py-2 text-sm bg-white/60 border border-white/80 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-slate-700 placeholder:text-slate-400 w-44"
            />
          </div>
          {/* Sort */}
          <div className="relative flex items-center gap-1.5 bg-white/60 border border-white/80 rounded-xl px-3 py-2">
            <SlidersHorizontal size={13} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm font-bold text-slate-600 bg-transparent outline-none cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="mastery">Mastery</option>
              <option value="date">Date Created</option>
            </select>
          </div>
        </div>
        
        {files.length === 0 ? (
          <div className="bg-white/30 backdrop-blur-md border-2 border-dashed border-white/50 rounded-[32px] p-16 text-center text-slate-500 flex flex-col items-center">
            <LibraryBig size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-bold text-slate-600">Your library is empty!</p>
            <p className="text-sm">Upload files in the AI or Library tab first, then come back here to generate study sets.</p>
          </div>
        ) : displayedFiles.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Search size={32} className="mx-auto mb-2 opacity-30" />
            <p className="font-bold">No files match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedFiles.map((file) => {
              const studySet = studySets[file.id];
              const isProcessing = isGenerating === file.id;
              
              const timeLeftMs = (48 * 3600 * 1000) - (Date.now() - (file.createdAt || Date.now()));
              const isExpired = timeLeftMs <= 0;

              const flashCount = studySet?.flashcards?.length || 0;
              const quizCount = studySet?.quiz?.length || 0;
              const lastStudied = studySet?.lastStudied ? new Date(studySet.lastStudied).toLocaleDateString([], { month: 'short', day: 'numeric' }) : null;

              return (
                <div key={file.id} className="bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-lg transition-all duration-300 rounded-[28px] p-6 flex flex-col gap-4 group hover:-translate-y-0.5 animate-in fade-in duration-300">

                  {/* Card Header */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl shrink-0 mt-0.5">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#2B3674] text-base leading-snug line-clamp-2 break-words" title={file.name}>{file.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-[11px] text-slate-400 font-medium">{file.size} &bull; {file.pages || 1} {file.pages === 1 ? 'Page' : 'Pages'}</p>
                        {lastStudied && <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Studied {lastStudied}</span>}
                        {isExpired && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Expired - Re-Sync in Library</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {studySet?.mastery !== undefined && (
                        <div className="flex flex-col items-center">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Mastery</p>
                          <div className="w-10 h-10 rounded-full border-4 border-indigo-100 bg-white shadow-sm flex items-center justify-center">
                            <span className="text-[10px] font-black text-indigo-600">{studySet.mastery}%</span>
                          </div>
                        </div>
                      )}
                      {studySet && (
                        confirmDeleteId === file.id ? (
                          <div className="flex items-center gap-1 mt-1">
                            <button onClick={() => deleteStudySet(file.id)} className="text-[10px] font-black text-white bg-red-500 px-2 py-1 rounded-lg hover:bg-red-600 transition-all">Yes</button>
                            <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg hover:bg-slate-200 transition-all">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(file.id)}
                            className="mt-1 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete study set"
                          ><Trash2 size={13} /></button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Study Set Content */}
                  {studySet ? (
                    <div className="flex flex-col gap-3 mt-auto">
                      <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-3">
                        <div className="flex-1 text-center">
                          <span className="block text-2xl font-black text-green-500 leading-none">{flashCount}</span>
                          <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">Flashcards</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="flex-1 text-center">
                          <span className="block text-2xl font-black text-orange-400 leading-none">{quizCount}</span>
                          <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">Quiz Qs</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => startFlashcards(file.id)} disabled={isExpired} className="py-2.5 px-3 bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500 hover:text-white rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                          <BookOpen size={15} /> Cards
                        </button>
                        <button onClick={() => startQuiz(file.id)} disabled={isExpired} className="py-2.5 px-3 bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500 hover:text-white rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                          <Target size={15} /> Quiz
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => extendStudySet(file, studySet)} disabled={isProcessing || isExpired} className="flex-1 py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-500 rounded-xl font-bold text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                          Extend
                        </button>
                        <button onClick={() => { if(window.confirm('This will reset your study set back to the original 10 cards and 5 questions. Are you sure?')) refreshStudySet(file.id); }} disabled={isProcessing || isExpired || (flashCount <= 10 && quizCount <= 5)} className="flex-1 py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 text-slate-500 rounded-xl font-bold text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" title="Resets current set completely">
                          <RotateCcw size={13} />
                          Refresh
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 border-t border-slate-100/60 flex flex-col gap-2">
                      {isExpired && <p className="text-[11px] text-center text-red-500 font-bold mb-1">File expired. Please re-sync in Library first.</p>}
                      <button onClick={() => generateStudySet(file)} disabled={isGenerating !== null || isExpired} className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95 ${ (isProcessing || isExpired) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-md hover:from-indigo-600 hover:to-purple-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {isProcessing ? <><Loader2 size={15} className="animate-spin" /> Analyzing...</> : <><Zap size={15} /> Generate AI Study Set</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}