import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, RotateCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExerciseBlank {
  position: number;
  correctAnswer?: string;
  placeholder?: string;
  acceptsAnyAnswer?: boolean;
}

interface FillInBlankExercise {
  type: "fill_in_blank";
  text: string;
  blanks: ExerciseBlank[];
}

interface LiveCallExercise {
  type: "live_call";
  title: string;
  description: string;
  duration: number;
  instructions?: string;
  topics?: string[];
}

type Exercise = FillInBlankExercise | LiveCallExercise;

interface ExerciseDisplayProps {
  exercise: Exercise;
  exerciseNumber?: number;
  userId?: string;
  moduleId?: string;
  isActive?: boolean;
  onSubmit?: (answers: string[], isCorrect: boolean) => void;
}

export const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({ exercise, exerciseNumber = 1, userId, moduleId, isActive = false, onSubmit }) => {
  // Handle only fill-in-blank exercises
  if (exercise.type !== "fill_in_blank") {
    return null; // Will be handled by a different component
  }


  const [answers, setAnswers] = useState<string[]>(new Array(exercise.blanks.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [hasBeenActivated, setHasBeenActivated] = useState(false);
  const queryClient = useQueryClient();

  // Load existing answer from database (only if userId and moduleId are provided)
  const { data: savedAnswer } = useQuery({
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

  // Load saved answers when component mounts or saved data changes
  useEffect(() => {
    if (savedAnswer) {
      setAnswers(savedAnswer.answers || new Array(exercise.blanks.length).fill(''));
      setSubmitted(savedAnswer.isSubmitted || false);
      
      // Always recalculate results if there are saved answers
      const savedResults = exercise.blanks.map((blank, index) => {
        const userAnswer = (savedAnswer.answers[index] || '').toLowerCase().trim();
        if (!userAnswer) return false; // No answer yet
        if (blank.acceptsAnyAnswer) {
          return userAnswer !== '';
        }
        return !!(blank.correctAnswer && userAnswer === blank.correctAnswer.toLowerCase().trim());
      });
      setResults(savedResults);
    } else {
      // Initialize empty state if no saved data
      setAnswers(new Array(exercise.blanks.length).fill(''));
      setSubmitted(false);
      setResults([]);
    }
  }, [savedAnswer, exercise.blanks]);

  // Debounce auto-save to prevent interference with typing
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const debouncedSave = (newAnswers: string[]) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (userId && moduleId) {
        saveAnswerMutation.mutate({
          userId,
          moduleId,
          exerciseIndex: exerciseNumber - 1,
          answers: newAnswers,
          isSubmitted: submitted,
          isCorrect: false
        });
      }
    }, 1000); // Wait 1 second after user stops typing
    
    setSaveTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Auto-focus on first empty input when exercise becomes active (only on initial activation)
  useEffect(() => {
    if (isActive && !submitted && !hasBeenActivated) {
      setHasBeenActivated(true);
      // Find the first empty input field
      const firstEmptyIndex = answers.findIndex(answer => answer.trim() === '');
      if (firstEmptyIndex !== -1) {
        // Focus the input field after a short delay to ensure it's rendered
        setTimeout(() => {
          const inputElement = document.querySelector(`[data-testid="exercise-input-${firstEmptyIndex}"]`) as HTMLInputElement;
          if (inputElement) {
            inputElement.focus();
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
    
    // Reset activation flag when exercise becomes inactive
    if (!isActive) {
      setHasBeenActivated(false);
    }
  }, [isActive, answers, submitted, hasBeenActivated]);

  const handleAnswerChange = (index: number, value: string) => {
    
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    
    // Debug logging removed for production
    
    // Auto-validate as user types (but only show results for filled answers)
    const newResults = exercise.blanks.map((blank, blankIndex) => {
      const userAnswer = (blankIndex === index ? value : newAnswers[blankIndex] || '').toLowerCase().trim();
      if (!userAnswer) return false; // No validation for empty answers
      if (blank.acceptsAnyAnswer) {
        return userAnswer !== '';
      }
      return !!(blank.correctAnswer && userAnswer === blank.correctAnswer.toLowerCase().trim());
    });
    setResults(newResults);
    
    // Auto-focus next empty field when current answer is correct
    if (value.trim() !== '') {
      const currentBlank = exercise.blanks[index];
      const userAnswer = value.toLowerCase().trim();
      
      // Check if current answer is correct
      let isCurrentCorrect = false;
      if (currentBlank.acceptsAnyAnswer) {
        isCurrentCorrect = userAnswer !== '';
      } else if (currentBlank.correctAnswer) {
        isCurrentCorrect = userAnswer === currentBlank.correctAnswer.toLowerCase().trim();
      }
      
      
      if (isCurrentCorrect) {
        // Find next empty field within this exercise only
        // Use the UPDATED answers array (newAnswers) to check for empty fields
        const nextEmptyIndex = newAnswers.findIndex((answer, answerIndex) => 
          answerIndex > index && (!answer || answer.trim() === '')
        );
        
        if (nextEmptyIndex !== -1) {
          // Use immediate setTimeout to ensure DOM is ready
          setTimeout(() => {
            // Look for the next input field within the same exercise using the exercise index
            const exerciseContainer = document.querySelector(`[data-exercise-index="${exerciseNumber - 1}"]`);
            if (exerciseContainer) {
              // Look for the next input within this specific exercise container
              const nextInput = exerciseContainer.querySelector(`[data-testid="exercise-input-${nextEmptyIndex}"]`) as HTMLInputElement;
              if (nextInput) {
                nextInput.focus();
                nextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }, 100); // Short timeout for immediate response
        } else {
          // No more empty fields - check if all answers are correct
          const allFilled = newAnswers.every(answer => answer && answer.trim() !== '');
          const allCorrect = newResults.every(result => result === true);
          
          if (allFilled && allCorrect) {
            // Auto-complete the exercise
            setTimeout(() => {
              setSubmitted(true);
              onSubmit?.(newAnswers, true);
            }, 500); // Small delay for visual feedback
          }
        }
      }
    }
    
    // Auto-save answers with debounce (only if persistence is enabled)
    debouncedSave(newAnswers);
  };

  const handleSubmit = () => {
    const newResults = exercise.blanks.map((blank, index) => {
      const userAnswer = answers[index]?.toLowerCase().trim();
      // If blank accepts any answer, consider it correct if not empty
      if (blank.acceptsAnyAnswer) {
        return userAnswer !== '';
      }
      // Otherwise check against correct answer
      return !!(blank.correctAnswer && userAnswer === blank.correctAnswer.toLowerCase().trim());
    });
    
    setResults(newResults);
    setSubmitted(true);
    
    const allCorrect = newResults.every(result => result === true);
    
    // Save submission state to database (only if persistence is enabled)
    if (userId && moduleId) {
      saveAnswerMutation.mutate({
        userId,
        moduleId,
        exerciseIndex: exerciseNumber - 1,
        answers,
        isSubmitted: true,
        isCorrect: allCorrect,
        submittedAt: new Date()
      });
    }
    
    onSubmit?.(answers, allCorrect);
  };

  const handleReset = () => {
    const emptyAnswers = new Array(exercise.blanks.length).fill('');
    setAnswers(emptyAnswers);
    setSubmitted(false);
    setResults([]);
    
    // Reset in database too (only if persistence is enabled)
    if (userId && moduleId) {
      saveAnswerMutation.mutate({
        userId,
        moduleId,
        exerciseIndex: exerciseNumber - 1,
        answers: emptyAnswers,
        isSubmitted: false,
        isCorrect: false
      });
    }
  };

  const parts = exercise.text.split('___');
  const allAnswered = answers.every(answer => answer.trim() !== '');
  const allCorrect = results.every(result => result);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Exercise {exerciseNumber}</CardTitle>
          {submitted && (
            <Badge variant={allCorrect ? "default" : "destructive"}>
              {allCorrect ? "Correct!" : "Try Again"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exercise Text with Input Fields */}
        <div className="text-lg leading-loose">
          <div className="whitespace-pre-wrap space-y-2">
            {parts.map((part, index) => (
              <React.Fragment key={index}>
                <span>{part}</span>
                {index < parts.length - 1 && (
                  <span className="relative inline-block mx-1">
                    <Input
                      type="text"
                      className={`inline-block w-24 text-center pr-6 mx-1 ${
                        answers[index]?.trim() && results[index] !== undefined
                          ? results[index] 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-red-500 bg-red-50'
                          : ''
                      }`}
                      placeholder={exercise.blanks[index]?.placeholder || "..."}
                      value={answers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={submitted}
                      data-testid={`exercise-input-${index}`}
                    />
                    {answers[index]?.trim() && results[index] !== undefined && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {results[index] ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-red-500" />
                        )}
                      </span>
                    )}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        {allAnswered && !allCorrect && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm">Need a hint?</h4>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Try watching the video again or think back to what you learned in this module.</p>
              <p>The answers are covered in the content above - take your time to review and try again!</p>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {submitted && allCorrect && (
          <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-sm text-green-800">Excellent work!</h4>
            <div className="text-sm text-green-700">
              <p>All answers are correct. You've successfully completed this exercise!</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {submitted && (
          <div className="flex gap-2">
            <Button 
              onClick={handleReset} 
              variant="outline"
              data-testid="button-reset-exercise"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
};