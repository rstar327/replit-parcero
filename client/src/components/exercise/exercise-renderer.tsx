import React from "react";
import { ExerciseDisplay } from "./exercise-display";
import { LiveCallExerciseDisplay } from "./live-call-exercise";
import { TrueFalseExerciseDisplay } from "./true-false-exercise";

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

interface TrueFalseExercise {
  type: "true_false";
  question: string;
  correctAnswer: boolean;
  explanation?: string;
}

type Exercise = FillInBlankExercise | LiveCallExercise | TrueFalseExercise;

interface ExerciseRendererProps {
  exercise: Exercise | any; // Allow legacy exercise format
  exerciseNumber?: number;
  userId?: string;
  moduleId?: string;
  isActive?: boolean;
  onSubmit?: (answers: string[], isCorrect: boolean) => void;
  onCallRequest?: (peerId: string) => void;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ 
  exercise, 
  exerciseNumber = 1, 
  userId, 
  moduleId, 
  isActive = false, 
  onSubmit,
  onCallRequest
}) => {
  // Handle legacy exercise format (no type field)
  if (!exercise.type) {
    // If it has text and blanks, treat it as fill-in-blank
    if (exercise.text && exercise.blanks) {
      const fillInBlankExercise: FillInBlankExercise = {
        type: "fill_in_blank",
        text: exercise.text,
        blanks: exercise.blanks
      };
      return (
        <ExerciseDisplay
          exercise={fillInBlankExercise}
          exerciseNumber={exerciseNumber}
          userId={userId}
          moduleId={moduleId}
          isActive={isActive}
          onSubmit={onSubmit}
        />
      );
    }
    
    // If it has title and duration, treat it as live call
    if (exercise.title && exercise.duration) {
      const liveCallExercise: LiveCallExercise = {
        type: "live_call",
        title: exercise.title,
        description: exercise.description || "Practice with a peer",
        duration: exercise.duration,
        instructions: exercise.instructions,
        topics: exercise.topics
      };
      return (
        <LiveCallExerciseDisplay
          exercise={liveCallExercise}
          exerciseNumber={exerciseNumber}
          userId={userId}
          moduleId={moduleId}
          isActive={isActive}
          onCallRequest={onCallRequest}
        />
      );
    }
    
    // Fallback: assume fill-in-blank for unknown format
    return null;
  }

  // Handle typed exercises
  switch (exercise.type) {
    case "fill_in_blank":
      return (
        <ExerciseDisplay
          exercise={exercise}
          exerciseNumber={exerciseNumber}
          userId={userId}
          moduleId={moduleId}
          isActive={isActive}
          onSubmit={onSubmit}
        />
      );
    
    case "live_call":
      return (
        <LiveCallExerciseDisplay
          exercise={exercise}
          exerciseNumber={exerciseNumber}
          userId={userId}
          moduleId={moduleId}
          isActive={isActive}
          onCallRequest={onCallRequest}
        />
      );
    
    case "true_false":
      return (
        <TrueFalseExerciseDisplay
          exercise={exercise}
          exerciseNumber={exerciseNumber}
          userId={userId}
          moduleId={moduleId}
          isActive={isActive}
          onSubmit={onSubmit}
        />
      );
    
    default:
      return null;
  }
};