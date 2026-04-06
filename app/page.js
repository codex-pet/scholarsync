import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PreviewSection from "@/components/landing/PreviewSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "ScholarSync — AI-Powered Study Assistant",
  description:
    "All-in-one AI-powered study assistant for students. Generate notes, create flashcards, summarize PDFs, and track your daily study progress.",
};

export default function LandingPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen relative">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <PreviewSection />
      <TestimonialsSection />
      <LandingFooter />
    </div>
  );
}