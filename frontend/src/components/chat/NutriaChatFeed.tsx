import React, { useState, useRef, useEffect } from 'react';
import { StickyMacroBar } from './StickyMacroBar';
import { MealDraftCard, type MealDraftData } from './MealDraftCard';
import { SmartOmnibar } from './SmartOmnibar';
import type { DailySummary, NutritionGoal, CreateMealEntryPayload } from '../../types/nutrition';
import { parseMealText, parseMealAudio, parseMealImage } from '../../services/api';
import { Mic, Loader2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nutria';
  type: 'text' | 'voice' | 'photo' | 'draft_card' | 'coach_note';
  text?: string;
  audioDuration?: string;
  photoUrl?: string;
  draftData?: MealDraftData;
  timestamp: string;
}

interface NutriaChatFeedProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  summary: DailySummary;
  goal: NutritionGoal;
  onAddMeal: (payload: CreateMealEntryPayload) => Promise<void>;
  onOpenSetGoals?: () => void;
  theme?: 'dark' | 'light';
}

export const NutriaChatFeed: React.FC<NutriaChatFeedProps> = ({
  messages,
  setMessages,
  summary,
  goal,
  onAddMeal,
  onOpenSetGoals,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [isLoading, setIsLoading] = useState(false);

  // Stateful Conversational Context (Appends missing details when AI asks clarification questions)
  const [pendingClarificationContext, setPendingClarificationContext] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message strictly within the chat container (prevents window scrolling on mobile)
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to test if a response is non-food, uncertain or clarification
  const isClarificationOrError = (res: { kcal: number; mealName?: string; confidenceNote?: string }) => {
    if (!res.kcal || res.kcal === 0) return true;
    if (res.mealName && (res.mealName.includes('Invalid') || res.mealName.includes('Uncertain') || res.mealName.includes('Non-Food'))) return true;
    if (res.confidenceNote && (res.confidenceNote.includes('?') || res.confidenceNote.toLowerCase().includes('what') || res.confidenceNote.toLowerCase().includes('please provide'))) return true;
    return false;
  };

  // 1. Handle Text Input
  const handleSendText = async (text: string) => {
    const userMsgId = 'user-' + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      type: 'text',
      text,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    const queryToSend = pendingClarificationContext
      ? `${pendingClarificationContext}, ${text}`
      : text;

    try {
      const res = await parseMealText(queryToSend);
      
      if (isClarificationOrError(res)) {
        if (res.confidenceNote && (res.confidenceNote.includes('?') || res.confidenceNote.toLowerCase().includes('what'))) {
          setPendingClarificationContext(queryToSend);
        } else {
          setPendingClarificationContext(null);
        }

        const noteText = res.confidenceNote || "I couldn't identify any clear food in your message. Please provide a description of what you ate.";
        const aiClarificationMsg: ChatMessage = {
          id: 'nutria-' + Date.now(),
          sender: 'nutria',
          type: 'coach_note',
          text: noteText,
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, aiClarificationMsg]);
      } else {
        setPendingClarificationContext(null);
        const draftMsg: ChatMessage = {
          id: 'nutria-' + Date.now(),
          sender: 'nutria',
          type: 'draft_card',
          draftData: {
            id: 'draft-' + Date.now(),
            mealName: res.mealName || text,
            kcal: res.kcal || 0,
            protein: res.protein || 0,
            carbs: res.carbs || 0,
            fat: res.fat || 0,
            confidenceNote: res.confidenceNote || 'Estimated with AI',
            isSaved: false,
            source: 'TEXT',
          },
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, draftMsg]);
      }
    } catch (err: unknown) {
      console.error('Error parsing text with AI:', err);
      const errorMsg: ChatMessage = {
        id: 'nutria-' + Date.now(),
        sender: 'nutria',
        type: 'coach_note',
        text: 'Sorry, I ran into an issue connecting to the nutrition service. Please try again.',
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Voice Input
  const handleSendVoice = async (audioBlob: Blob, durationSec: number) => {
    const formattedDuration = `${Math.floor(durationSec / 60)}:${durationSec % 60 < 10 ? '0' : ''}${durationSec % 60}`;
    const userMsgId = 'user-' + Date.now();
    
    const newVoiceMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      type: 'voice',
      audioDuration: formattedDuration,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, newVoiceMsg]);
    setIsLoading(true);

    try {
      const audioFile = new File([audioBlob], `voice-log-${Date.now()}.webm`, { type: audioBlob.type || 'audio/webm' });
      const res = await parseMealAudio(audioFile);

      if (isClarificationOrError(res)) {
        const noteText = res.confidenceNote || "The audio didn't have enough clear detail. Could you mention what you ate again?";
        const aiClarificationMsg: ChatMessage = {
          id: 'nutria-' + Date.now(),
          sender: 'nutria',
          type: 'coach_note',
          text: noteText,
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, aiClarificationMsg]);
      } else {
        const draftMsg: ChatMessage = {
          id: 'nutria-' + Date.now(),
          sender: 'nutria',
          type: 'draft_card',
          draftData: {
            id: 'draft-' + Date.now(),
            mealName: res.mealName || 'Voice Logged Meal',
            kcal: res.kcal || 0,
            protein: res.protein || 0,
            carbs: res.carbs || 0,
            fat: res.fat || 0,
            confidenceNote: res.confidenceNote || 'Estimated from voice memo',
            isSaved: false,
            source: 'AUDIO',
          },
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, draftMsg]);
      }
    } catch (err) {
      console.error('Error parsing voice with AI:', err);
      const errorMsg: ChatMessage = {
        id: 'nutria-' + Date.now(),
        sender: 'nutria',
        type: 'coach_note',
        text: "I couldn't clearly transcribe that audio note. Please try speaking closer to your mic or write the meal text.",
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Photo Input
  const handleSelectPhoto = async (file: File) => {
    const photoUrl = URL.createObjectURL(file);
    const userMsgId = 'user-' + Date.now();

    const newPhotoMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      type: 'photo',
      photoUrl,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, newPhotoMsg]);
    setIsLoading(true);

    try {
      const res = await parseMealImage(file);

      if (isClarificationOrError(res)) {
        const noteText = res.confidenceNote || "I couldn't identify the meal clearly from this image. Could you tell me what it was?";
        const aiClarificationMsg: ChatMessage = {
          id: 'nutria-' + Date.now(),
          sender: 'nutria',
          type: 'coach_note',
          text: noteText,
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, aiClarificationMsg]);
      } else {
        const draftMsg: ChatMessage = {
          id: 'nutria-' + Date.now(),
          sender: 'nutria',
          type: 'draft_card',
          draftData: {
            id: 'draft-' + Date.now(),
            mealName: res.mealName || 'Photo Logged Meal',
            kcal: res.kcal || 0,
            protein: res.protein || 0,
            carbs: res.carbs || 0,
            fat: res.fat || 0,
            confidenceNote: res.confidenceNote || 'Estimated from photo scan',
            isSaved: false,
            source: 'IMAGE',
          },
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, draftMsg]);
      }
    } catch (err) {
      console.error('Error parsing photo with AI:', err);
      const errorMsg: ChatMessage = {
        id: 'nutria-' + Date.now(),
        sender: 'nutria',
        type: 'coach_note',
        text: "I couldn't analyze the food photo. Please check your network connection or describe your meal in text.",
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Save Draft to PostgreSQL
  const handleSaveDraft = async (draftId: string, data: Omit<MealDraftData, 'id' | 'isSaved'>) => {
    await onAddMeal({
      mealName: data.mealName,
      kcal: data.kcal,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      source: data.source || 'AI_PARSER',
    });

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.draftData && msg.draftData.id === draftId) {
          return {
            ...msg,
            draftData: {
              ...msg.draftData,
              ...data,
              isSaved: true,
            },
          };
        }
        return msg;
      })
    );
  };

  // 5. Handle Discard Draft
  const handleDiscardDraft = (draftId: string) => {
    setMessages((prev) => prev.filter((msg) => !(msg.draftData && msg.draftData.id === draftId)));
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-7xl mx-auto overflow-hidden min-h-0 justify-between">
      
      {/* Sticky Top Macro Bar */}
      <div className="shrink-0 pb-2 sm:pb-3">
        <StickyMacroBar
          summary={summary}
          goal={goal}
          theme={theme}
          onOpenSetGoals={onOpenSetGoals}
        />
      </div>

      {/* CHAT MESSAGES STREAM (OpenAI / ChatGPT Minimalist Layout) */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain no-scrollbar space-y-6 px-1 sm:px-3 py-2 min-h-0"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          if (isUser) {
            return (
              <div key={msg.id} className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* User Text Bubble */}
                {msg.type === 'text' && (
                  <div className={`max-w-[85%] sm:max-w-md px-4 sm:px-5 py-3 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-medium shadow-sm ${
                    isLight
                      ? 'bg-black text-white rounded-tr-xs'
                      : 'bg-white text-black font-semibold rounded-tr-xs shadow-md shadow-black/40'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                )}

                {/* User Voice Bubble */}
                {msg.type === 'voice' && (
                  <div className={`max-w-md px-4 sm:px-5 py-2.5 rounded-2xl sm:rounded-3xl border flex items-center space-x-3 shadow-sm ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900 rounded-tr-xs'
                      : 'bg-[#18181b] border-white/[0.08] text-white rounded-tr-xs'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-black text-white' : 'bg-white text-black'
                    }`}>
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center space-x-1 h-5">
                      {[8, 16, 12, 20, 14, 24, 10, 18, 6].map((h, idx) => (
                        <div
                          key={idx}
                          className={`w-1 rounded-full ${isLight ? 'bg-black' : 'bg-white'}`}
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-zinc-400 font-mono pl-1">
                      {msg.audioDuration || '0:05'}
                    </span>
                  </div>
                )}

                {/* User Photo Bubble */}
                {msg.type === 'photo' && msg.photoUrl && (
                  <div className={`p-1 rounded-2xl sm:rounded-3xl border overflow-hidden shadow-sm max-w-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121214] border-white/[0.08]'
                  }`}>
                    <img
                      src={msg.photoUrl}
                      alt="Uploaded meal"
                      className="w-full max-h-56 object-cover rounded-xl sm:rounded-2xl"
                    />
                  </div>
                )}

                <span className="text-[10px] font-semibold text-zinc-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          }

          // Nutria Assistant Messages (Clean typography, no avatar, no heavy box)
          return (
            <div key={msg.id} className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-2xl">
              
              {/* Assistant Text — Clean open text like ChatGPT */}
              {msg.type === 'text' && (
                <div className={`px-1 py-1 text-sm sm:text-base font-medium leading-relaxed ${
                  isLight ? 'text-slate-800' : 'text-zinc-200'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              )}

              {/* Assistant Clarification Note */}
              {msg.type === 'coach_note' && (
                <div className={`px-1 py-1 text-sm sm:text-base font-medium leading-relaxed ${
                  isLight ? 'text-slate-900' : 'text-zinc-300'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              )}

              {/* Assistant Draft Meal Card */}
              {msg.type === 'draft_card' && msg.draftData && (
                <div className="w-full mt-1">
                  <MealDraftCard
                    draft={msg.draftData}
                    onSave={(data) => handleSaveDraft(msg.draftData!.id, data)}
                    onDiscard={handleDiscardDraft}
                    theme={theme}
                  />
                </div>
              )}

              <span className="text-[10px] font-semibold text-zinc-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Minimalist AI Thinking Spinner */}
        {isLoading && (
          <div className="flex items-center space-x-2.5 px-1 py-2 animate-in fade-in duration-200">
            <Loader2 className={`w-4 h-4 animate-spin ${isLight ? 'text-slate-900' : 'text-white'}`} />
            <span className={`text-xs sm:text-sm font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Nutria is analyzing...
            </span>
          </div>
        )}

        <div className="h-1" />
      </div>

      {/* Fixed Bottom Smart Omnibar with Mobile Safe Area */}
      <div className="shrink-0 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <SmartOmnibar
          onSendText={handleSendText}
          onSendVoice={handleSendVoice}
          onSelectPhoto={handleSelectPhoto}
          isLoading={isLoading}
          theme={theme}
        />
      </div>

    </div>
  );
};
