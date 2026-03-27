// app/layout.js
import "./globals.css";
import ClientLayout from "./ClientLayout";

// THIS IS WHERE YOU CHANGE THE ICON AND TITLE
export const metadata = {
  title: "ScholarSync",
  description: "Your project description",
  icons: {
    icon: "/scholarsync-logo.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* We move the body and logic into the ClientLayout component */}
      <ClientLayout>
        {children}
      </ClientLayout>
    </html>
  );
}