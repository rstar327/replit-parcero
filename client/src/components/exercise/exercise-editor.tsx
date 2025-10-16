import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Eye, Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ExerciseDisplay } from "./exercise-display";
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

interface ExerciseEditorProps {
  exercise?: Exercise | any; // Allow legacy format
  onChange: (exercise: Exercise | undefined) => void;
}

export default function ExerciseEditor({ exercise, onChange }: ExerciseEditorProps) {
  const [exerciseType, setExerciseType] = useState<"fill_in_blank" | "live_call" | "true_false">("fill_in_blank");
  const [exerciseText, setExerciseText] = useState("");
  const [blanks, setBlanks] = useState<ExerciseBlank[]>([]);
  const [activeTab, setActiveTab] = useState("editor");
  
  // Live call exercise fields
  const [callTitle, setCallTitle] = useState("");
  const [callDescription, setCallDescription] = useState("");
  const [callDuration, setCallDuration] = useState(10);
  const [callInstructions, setCallInstructions] = useState("");
  const [callTopics, setCallTopics] = useState<string[]>([]);
  
  // True/false exercise fields
  const [trueFalseQuestion, setTrueFalseQuestion] = useState("");
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(true);
  const [trueFalseExplanation, setTrueFalseExplanation] = useState("");

  // Initialize from props
  useEffect(() => {
    if (exercise) {
      if (exercise.type === "live_call") {
        setExerciseType("live_call");
        setCallTitle(exercise.title || "");
        setCallDescription(exercise.description || "");
        setCallDuration(exercise.duration || 10);
        setCallInstructions(exercise.instructions || "");
        setCallTopics(exercise.topics || []);
      } else if (exercise.type === "true_false") {
        setExerciseType("true_false");
        setTrueFalseQuestion(exercise.question || "");
        setTrueFalseAnswer(exercise.correctAnswer ?? true);
        setTrueFalseExplanation(exercise.explanation || "");
      } else if (exercise.type === "fill_in_blank" || (exercise.text && exercise.blanks)) {
        setExerciseType("fill_in_blank");
        setExerciseText(exercise.text || "");
        setBlanks(exercise.blanks || []);
      }
    }
  }, [exercise]);

  // Auto-detect blanks from text and sync
  useEffect(() => {
    const detectedBlanksCount = (exerciseText.match(/___/g) || []).length;
    
    // Sync blanks array with detected blanks
    if (detectedBlanksCount !== blanks.length) {
      const newBlanks: ExerciseBlank[] = [];
      for (let i = 0; i < detectedBlanksCount; i++) {
        // Keep existing blank data if available, otherwise create new
        const existingBlank = blanks[i];
        newBlanks.push({
          position: i,
          correctAnswer: existingBlank?.correctAnswer || "",
          placeholder: "...",
          acceptsAnyAnswer: existingBlank?.acceptsAnyAnswer || false
        });
      }
      setBlanks(newBlanks);
    }
  }, [exerciseText]);

  // Update parent when exercise changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (exerciseType === "live_call") {
        if (callTitle || callDescription) {
          const liveCallExercise: LiveCallExercise = {
            type: "live_call",
            title: callTitle,
            description: callDescription,
            duration: callDuration,
            instructions: callInstructions || undefined,
            topics: callTopics.length > 0 ? callTopics : undefined
          };
          onChange(liveCallExercise);
        } else {
          onChange(undefined);
        }
      } else if (exerciseType === "true_false") {
        if (trueFalseQuestion) {
          const trueFalseExercise: TrueFalseExercise = {
            type: "true_false",
            question: trueFalseQuestion,
            correctAnswer: trueFalseAnswer,
            explanation: trueFalseExplanation || undefined
          };
          onChange(trueFalseExercise);
        } else {
          onChange(undefined);
        }
      } else {
        if (exerciseText || blanks.length > 0) {
          const fillInBlankExercise: FillInBlankExercise = {
            type: "fill_in_blank",
            text: exerciseText,
            blanks: blanks
          };
          onChange(fillInBlankExercise);
        } else {
          onChange(undefined);
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [exerciseType, exerciseText, blanks, callTitle, callDescription, callDuration, callInstructions, callTopics, trueFalseQuestion, trueFalseAnswer, trueFalseExplanation, onChange]);


  const removeBlank = (index: number) => {
    setBlanks(blanks.filter((_, i) => i !== index));
  };

  const updateBlank = (index: number, field: keyof ExerciseBlank, value: string | boolean) => {
    const updatedBlanks = [...blanks];
    (updatedBlanks[index] as any)[field] = value;
    setBlanks(updatedBlanks);
  };

  const clearExercise = () => {
    if (exerciseType === "live_call") {
      setCallTitle("");
      setCallDescription("");
      setCallDuration(10);
      setCallInstructions("");
      setCallTopics([]);
    } else if (exerciseType === "true_false") {
      setTrueFalseQuestion("");
      setTrueFalseAnswer(true);
      setTrueFalseExplanation("");
    } else {
      setExerciseText("");
      setBlanks([]);
    }
    onChange(undefined);
  };

  const addTopic = () => {
    setCallTopics([...callTopics, ""]);
  };

  const removeTopic = (index: number) => {
    setCallTopics(callTopics.filter((_, i) => i !== index));
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...callTopics];
    newTopics[index] = value;
    setCallTopics(newTopics);
  };

  const hasExercise = exerciseType === "live_call" 
    ? (callTitle || callDescription) 
    : exerciseType === "true_false"
    ? (trueFalseQuestion)
    : (exerciseText || blanks.length > 0);
    
  const currentExercise = exerciseType === "live_call" 
    ? (callTitle || callDescription ? { type: "live_call", title: callTitle, description: callDescription, duration: callDuration } : null)
    : exerciseType === "true_false"
    ? (trueFalseQuestion ? { type: "true_false", question: trueFalseQuestion, correctAnswer: trueFalseAnswer, explanation: trueFalseExplanation } : null)
    : (hasExercise ? { type: "fill_in_blank", text: exerciseText, blanks } : null);

  return (
    <div className="space-y-4">
      {/* Exercise Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Exercise Type</label>
        <Select value={exerciseType} onValueChange={(value: "fill_in_blank" | "live_call" | "true_false") => setExerciseType(value)}>
          <SelectTrigger data-testid="select-exercise-type">
            <SelectValue placeholder="Select exercise type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
            <SelectItem value="live_call">Live Peer Call</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {exerciseType === "live_call" 
            ? "Students will practice speaking with other online peers"
            : exerciseType === "true_false"
            ? "Students answer true or false questions based on the content"
            : "Students fill in missing words or phrases"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Exercise Editor</TabsTrigger>
          <TabsTrigger value="preview" disabled={!currentExercise}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {exerciseType === "live_call" 
                ? "Configure live peer calling exercise for speaking practice"
                : exerciseType === "true_false"
                ? "Create true/false questions based on the learning content"
                : "Create fill-in-the-blank exercises. Use ___ (triple underscore) to mark blanks in your text."
              }
            </p>
            {hasExercise && (
              <Button variant="outline" size="sm" onClick={clearExercise}>
                Clear Exercise
              </Button>
            )}
          </div>

          {/* Form content based on exercise type */}
          {exerciseType === "live_call" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Call Title *</label>
                <Input
                  placeholder="e.g., Practice Business Presentations"
                  value={callTitle}
                  onChange={(e) => setCallTitle(e.target.value)}
                  data-testid="input-call-title"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe what students will practice in this live call session..."
                  value={callDescription}
                  onChange={(e) => setCallDescription(e.target.value)}
                  rows={3}
                  data-testid="textarea-call-description"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Select value={callDuration.toString()} onValueChange={(value) => setCallDuration(parseInt(value))}>
                  <SelectTrigger data-testid="select-call-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Instructions (Optional)</label>
                <Textarea
                  placeholder="Specific instructions for the conversation..."
                  value={callInstructions}
                  onChange={(e) => setCallInstructions(e.target.value)}
                  rows={2}
                  data-testid="textarea-call-instructions"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Conversation Topics (Optional)</label>
                  <Button variant="outline" size="sm" onClick={addTopic} data-testid="button-add-topic">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Topic
                  </Button>
                </div>
                {callTopics.length > 0 && (
                  <div className="space-y-2">
                    {callTopics.map((topic, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="e.g., Introducing yourself"
                          value={topic}
                          onChange={(e) => updateTopic(index, e.target.value)}
                          data-testid={`input-topic-${index}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTopic(index)}
                          data-testid={`button-remove-topic-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : exerciseType === "true_false" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question *</label>
                <Textarea
                  placeholder="Enter your true/false question here. Example: According to the video, business emails should always be formal."
                  value={trueFalseQuestion}
                  onChange={(e) => setTrueFalseQuestion(e.target.value)}
                  rows={3}
                  data-testid="textarea-true-false-question"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Correct Answer *</label>
                <Select value={trueFalseAnswer.toString()} onValueChange={(value) => setTrueFalseAnswer(value === 'true')}>
                  <SelectTrigger data-testid="select-true-false-answer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Explanation (Optional)</label>
                <Textarea
                  placeholder="Explain why this answer is correct. This will be shown to students after they answer correctly."
                  value={trueFalseExplanation}
                  onChange={(e) => setTrueFalseExplanation(e.target.value)}
                  rows={2}
                  data-testid="textarea-true-false-explanation"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Exercise Text</label>
                <Textarea
                  placeholder="Enter your exercise text here. Use ___ (triple underscore) to mark where students should fill in blanks. Example: The capital of France is ___."
                  value={exerciseText}
                  onChange={(e) => setExerciseText(e.target.value)}
                  rows={4}
                  data-testid="textarea-exercise-text"
                />
                {exerciseText && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Blanks found: {(exerciseText.match(/___/g) || []).length}
                  </p>
                )}
              </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Correct Answers</label>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure answers for each blank detected in your text above.
                </p>
              </div>

              {blanks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No answer blanks defined yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add the correct answers for each blank in your exercise text.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {blanks.map((blank, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">
                            Blank {index + 1}
                          </Badge>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`accepts-any-${index}`}
                                checked={blank.acceptsAnyAnswer || false}
                                onCheckedChange={(checked) => updateBlank(index, 'acceptsAnyAnswer', checked as boolean)}
                                data-testid={`checkbox-any-answer-${index}`}
                              />
                              <label 
                                htmlFor={`accepts-any-${index}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Accept any answer
                              </label>
                            </div>
                            <div>
                              <Input
                                placeholder={blank.acceptsAnyAnswer ? "Correct answer (optional)" : "Correct answer (required)"}
                                value={blank.correctAnswer || ""}
                                onChange={(e) => updateBlank(index, 'correctAnswer', e.target.value)}
                                data-testid={`input-answer-${index}`}
                                disabled={blank.acceptsAnyAnswer}
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBlank(index)}
                            data-testid={`button-remove-blank-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="bg-muted/50 p-6 rounded-lg">
            {currentExercise ? (
              exerciseType === "live_call" ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{callTitle}</h3>
                  <p className="text-muted-foreground">{callDescription}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Duration: {callDuration} minutes</span>
                  </div>
                  {callInstructions && (
                    <div>
                      <h4 className="font-medium mb-2">Instructions:</h4>
                      <p className="text-sm text-muted-foreground">{callInstructions}</p>
                    </div>
                  )}
                  {callTopics.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Topics to discuss:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {callTopics.map((topic, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : exerciseType === "true_false" ? (
                <TrueFalseExerciseDisplay exercise={currentExercise as TrueFalseExercise} exerciseNumber={1} />
              ) : (
                <ExerciseDisplay exercise={currentExercise as FillInBlankExercise} exerciseNumber={1} />
              )
            ) : (
              <p className="text-center text-muted-foreground">No exercise to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}