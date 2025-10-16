import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, HelpCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TrueFalseExercise {
  type: "true_false";
  question: string;
  correctAnswer: boolean;
  explanation?: string;
}

interface TrueFalseExerciseDisplayProps {
  exercise: TrueFalseExercise;
  exerciseNumber?: number;
  userId?: string;
  moduleId?: string;
  isActive?: boolean;
  onSubmit?: (answers: string[], isCorrect: boolean) => void;
}

export const TrueFalseExerciseDisplay: React.FC<TrueFalseExerciseDisplayProps> = ({
  exercise,
  exerciseNumber = 1,
  userId,
  moduleId,
  isActive = false,
  onSubmit
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const queryClient = useQueryClient();

  // Load existing answer from database
  const { data: existingAnswer } = useQuery({
    queryKey: ['exercise-answer', userId, moduleId, exerciseNumber - 1],
    queryFn: async () => {
      if (!userId || !moduleId) return null;
      const response = await fetch(`/api/exercise-answers/${userId}/${moduleId}/${exerciseNumber - 1}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to load exercise answer');
      return response.json();
    },
    enabled: !!(userId && moduleId)
  });

  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/exercise-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save exercise answer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-answer', userId, moduleId, exerciseNumber - 1] });
    }
  });

  // Load existing answer when component mounts
  useEffect(() => {
    if (existingAnswer) {
      const answers = (existingAnswer as any).answers;
      if (answers && answers.length > 0) {
        const answer = answers[0];
        if (answer === 'true' || answer === 'false') {
          setSelectedAnswer(answer === 'true');
          setSubmitted((existingAnswer as any).isSubmitted || false);
          if ((existingAnswer as any).isSubmitted) {
            setIsCorrect((existingAnswer as any).isCorrect || false);
          }
        }
      }
    }
  }, [existingAnswer]);

  const handleAnswerSelect = (answer: boolean) => {
    if (submitted) return;
    
    setSelectedAnswer(answer);
    
    // Auto-save the answer (but don't submit yet)
    if (userId && moduleId) {
      saveAnswerMutation.mutate({
        userId,
        moduleId,
        exerciseIndex: exerciseNumber - 1,
        answers: [answer.toString()],
        isSubmitted: false,
        isCorrect: false
      });
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === exercise.correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);
    
    // Save submission state to database
    if (userId && moduleId) {
      saveAnswerMutation.mutate({
        userId,
        moduleId,
        exerciseIndex: exerciseNumber - 1,
        answers: [selectedAnswer.toString()],
        isSubmitted: true,
        isCorrect: correct,
        submittedAt: new Date()
      });
    }
    
    onSubmit?.([selectedAnswer.toString()], correct);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setIsCorrect(null);
    
    // Reset in database too
    if (userId && moduleId) {
      saveAnswerMutation.mutate({
        userId,
        moduleId,
        exerciseIndex: exerciseNumber - 1,
        answers: [],
        isSubmitted: false,
        isCorrect: false
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Exercise {exerciseNumber}</CardTitle>
          {submitted && (
            <Badge variant={isCorrect ? "default" : "destructive"}>
              {isCorrect ? "Correct!" : "Try Again"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="text-lg leading-relaxed">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-4">{exercise.question}</p>
            </div>
          </div>
        </div>

        {/* True/False Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant={selectedAnswer === true ? "default" : "outline"}
            size="lg"
            onClick={() => handleAnswerSelect(true)}
            disabled={submitted}
            className={`min-w-24 ${
              submitted && selectedAnswer === true
                ? isCorrect 
                  ? 'bg-green-500 hover:bg-green-600 border-green-500' 
                  : 'bg-red-500 hover:bg-red-600 border-red-500'
                : ''
            }`}
            data-testid="true-button"
          >
            <div className="flex items-center space-x-2">
              <span>True</span>
              {submitted && selectedAnswer === true && (
                isCorrect ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )
              )}
            </div>
          </Button>
          
          <Button
            variant={selectedAnswer === false ? "default" : "outline"}
            size="lg"
            onClick={() => handleAnswerSelect(false)}
            disabled={submitted}
            className={`min-w-24 ${
              submitted && selectedAnswer === false
                ? isCorrect 
                  ? 'bg-green-500 hover:bg-green-600 border-green-500' 
                  : 'bg-red-500 hover:bg-red-600 border-red-500'
                : ''
            }`}
            data-testid="false-button"
          >
            <div className="flex items-center space-x-2">
              <span>False</span>
              {submitted && selectedAnswer === false && (
                isCorrect ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )
              )}
            </div>
          </Button>
        </div>

        {/* Submit Button */}
        {!submitted && selectedAnswer !== null && (
          <div className="flex justify-center">
            <Button onClick={handleSubmit} data-testid="submit-button">
              Submit Answer
            </Button>
          </div>
        )}

        {/* Feedback Section */}
        {submitted && !isCorrect && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm">Need a hint?</h4>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Try watching the video again or think back to what you learned in this module.</p>
              <p>The answer is covered in the content above - take your time to review and try again!</p>
            </div>
          </div>
        )}

        {/* Success Message with Explanation */}
        {submitted && isCorrect && (
          <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-sm text-green-800">Excellent work!</h4>
            <div className="text-sm text-green-700">
              <p className="mb-2">That's correct! You've successfully completed this exercise.</p>
              {exercise.explanation && (
                <div className="mt-3 p-3 bg-green-100 rounded-md">
                  <p className="font-medium text-green-800 mb-1">Explanation:</p>
                  <p>{exercise.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {submitted && (
          <div className="flex gap-2">
            <Button 
              onClick={handleReset} 
              variant="outline"
              data-testid="reset-button"
            >
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};