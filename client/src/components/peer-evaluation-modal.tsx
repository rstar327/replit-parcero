import React, { useState } from "react";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PeerEvaluationModalProps {
  open: boolean;
  onClose: () => void;
  onEvaluate: (evaluation: {
    grammarRating: number;
    vocabularyRating: number;
    pronunciationRating: number;
    approved: boolean;
    feedback: string;
  }) => void;
  practiceUserName: string;
  language: "en" | "es";
}

export function PeerEvaluationModal({
  open,
  onClose,
  onEvaluate,
  practiceUserName,
  language
}: PeerEvaluationModalProps) {
  const [grammarRating, setGrammarRating] = useState(0);
  const [vocabularyRating, setVocabularyRating] = useState(0);
  const [pronunciationRating, setPronunciationRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredStar, setHoveredStar] = useState<{category: string, rating: number} | null>(null);

  const maxCharacters = 140;
  const remainingChars = maxCharacters - feedback.length;

  const skillDescriptions = {
    grammar: language === "en" 
      ? ["Poor", "Needs work", "Okay", "Good", "Excellent"]
      : ["Malo", "Necesita trabajo", "Regular", "Bueno", "Excelente"],
    vocabulary: language === "en"
      ? ["Limited", "Basic", "Fair", "Good", "Rich"]
      : ["Limitado", "Básico", "Regular", "Bueno", "Rico"],
    pronunciation: language === "en"
      ? ["Unclear", "Hard to follow", "Understandable", "Clear", "Perfect"]
      : ["Poco claro", "Difícil seguir", "Entendible", "Claro", "Perfecto"]
  };

  const StarRating = ({ 
    rating, 
    onRate, 
    category 
  }: { 
    rating: number; 
    onRate: (rating: number) => void; 
    category: 'grammar' | 'vocabulary' | 'pronunciation';
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => setHoveredStar({ category, rating: star })}
            onMouseLeave={() => setHoveredStar(null)}
            className="focus:outline-none transition-colors"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
        {hoveredStar?.category === category && (
          <span className="ml-2 text-sm text-gray-600">
            {skillDescriptions[category][hoveredStar.rating - 1]}
          </span>
        )}
      </div>
    );
  };

  const handleSubmit = (approved: boolean) => {
    if (grammarRating === 0 || vocabularyRating === 0 || pronunciationRating === 0) {
      return; // Don't submit if ratings are missing
    }
    
    if (feedback.trim().length === 0) {
      return; // Don't submit if feedback is empty
    }

    onEvaluate({
      grammarRating,
      vocabularyRating,
      pronunciationRating,
      approved,
      feedback: feedback.trim()
    });

    // Reset form
    setGrammarRating(0);
    setVocabularyRating(0);
    setPronunciationRating(0);
    setFeedback("");
  };

  const canSubmit = grammarRating > 0 && vocabularyRating > 0 && pronunciationRating > 0 && feedback.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {language === "en" ? "Evaluate Practice Session" : "Evaluar Sesión de Práctica"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === "en" 
              ? `How did ${practiceUserName} perform?` 
              : `¿Cómo se desempeñó ${practiceUserName}?`
            }
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Grammar Rating */}
            <div>
              <h4 className="font-medium mb-2">
                {language === "en" ? "Grammar" : "Gramática"}
              </h4>
              <StarRating
                rating={grammarRating}
                onRate={setGrammarRating}
                category="grammar"
              />
            </div>

            {/* Vocabulary Rating */}
            <div>
              <h4 className="font-medium mb-2">
                {language === "en" ? "Vocabulary" : "Vocabulario"}
              </h4>
              <StarRating
                rating={vocabularyRating}
                onRate={setVocabularyRating}
                category="vocabulary"
              />
            </div>

            {/* Pronunciation Rating */}
            <div>
              <h4 className="font-medium mb-2">
                {language === "en" ? "Pronunciation" : "Pronunciación"}
              </h4>
              <StarRating
                rating={pronunciationRating}
                onRate={setPronunciationRating}
                category="pronunciation"
              />
            </div>

            {/* Feedback */}
            <div>
              <h4 className="font-medium mb-2">
                {language === "en" ? "Feedback" : "Comentarios"}
              </h4>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, maxCharacters))}
                placeholder={language === "en" 
                  ? "Share specific feedback to help them improve..." 
                  : "Comparte comentarios específicos para ayudarles a mejorar..."
                }
                rows={3}
                className="resize-none"
                data-testid="feedback-textarea"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  {language === "en" ? "Required" : "Requerido"}
                </span>
                <span className={`text-xs ${remainingChars < 20 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {remainingChars}/{maxCharacters}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={!canSubmit}
            className="flex-1"
            data-testid="button-needs-practice"
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            {language === "en" ? "Needs More Practice" : "Necesita Más Práctica"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={!canSubmit}
            className="flex-1"
            data-testid="button-approve"
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            {language === "en" ? "Approve" : "Aprobar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}