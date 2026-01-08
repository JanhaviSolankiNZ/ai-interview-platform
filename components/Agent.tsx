'use client';
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {cleanTranscript, cn} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SpeechEngine } from "@/lib/SpeechEngine";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "assistant";
    content: string;
}

interface AgentProps {
    userName: string;
}

export default function Agent({ userName }: AgentProps) {
    const router = useRouter();

    const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [answers, setAnswers] = useState<{
        role?: string;
        type?: string;
        level?: string;
        techstack?: string[];
        amount?: number;
    }>({});

    const currentQuestionIndex = useRef(0);
    const speechEngineRef = useRef<SpeechEngine | null>(null);

    const questions = [
        { key: "greeting", text: `Hey ${userName}, let's prepare for your interview. Are you ready?` },
        { key: "role", text: "What role would you like to train for?" },
        { key: "type", text: "Are you aiming for a technical, behavioural, or mixed interview?" },
        { key: "level", text: "What is your job experience level?" },
        { key: "techstack", text: "Please list the technologies you want to cover during the interview." },
        { key: "amount", text: "How many questions would you like to generate?" },
    ];

    /* =========================
       INIT SPEECH ENGINE
    ========================= */
    useEffect(() => {
        speechEngineRef.current = new SpeechEngine(handleFinalTranscript, {
            onSpeakingChange: setIsSpeaking,
            onListeningChange: setIsListening,
        });
        return () => {
            speechEngineRef.current?.destroy();
            window.speechSynthesis.cancel();
        };
    }, []);

    /* =========================
       START CALL
    ========================= */
    const startCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        setTimeout(async () => {
            setCallStatus(CallStatus.ACTIVE);
            await askQuestion(currentQuestionIndex.current);
        }, 500);
    };

    /* =========================
       ASK QUESTION
    ========================= */
    const askQuestion = async (index: number) => {
        const q = questions[index];

        setMessages((prev) => [...prev, { role: "assistant", content: q.text }]);

        await speechEngineRef.current?.speak(q.text);
        await speechEngineRef.current?.startListening();
    };

    /* =========================
       HANDLE ANSWER
    ========================= */
    const handleFinalTranscript = (rawText: string) => {
        const text = cleanTranscript(rawText);
        const index = currentQuestionIndex.current;
        const question = questions[index];

        const cleanText = text.trim();

        // Save transcript message
        setMessages((prev) => [
            ...prev,
            { role: "user", content: cleanText || "not_answered" },
        ]);

        // 🧠 STORE ANSWERS HERE
        setAnswers((prev) => {
            const updated = { ...prev };

            switch (question.key) {
                case "techstack":
                    updated.techstack = cleanText
                        .split(/,|and/i)
                        .map((t) => t.trim())
                        .filter(Boolean);
                    break;

                case "amount":
                    const num = cleanText.match(/\d+/);
                    updated.amount = num ? parseInt(num[0], 10) : 5;
                    break;

                default:
                    (updated as any)[question.key] = cleanText;
            }

            return updated;
        });

        // Move to next question
        if (index + 1 < questions.length) {
            currentQuestionIndex.current += 1;
            askQuestion(currentQuestionIndex.current);
        } else {
            setCallStatus(CallStatus.FINISHED);
        }
    };


    /* =========================
       END CALL
    ========================= */
    const endCall = () => {
        setCallStatus(CallStatus.FINISHED);
        speechEngineRef.current?.stopListening();
    };

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) router.push("/");
    }, [callStatus, router]);

    const lastMessage = messages[messages.length - 1]?.content;
    const isInactiveOrFinished =
        callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    /* =========================
       UI
    ========================= */
    console.log("ANSWERS", answers);
    return (
        <>
            <div className="call-view">
                {/* AI */}
                <div className="card-interviewer">
                    <div className="avatar relative">
                        <Image src="/ai-avatar.png" alt="ai" width={65} height={65} />
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                {/* USER */}
                <div className="card-border">
                    <div className="card-content relative">
                        <Image
                            src="/user-avatar.png"
                            alt="user avatar"
                            width={120}
                            height={120}
                            className="rounded-full"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={lastMessage}
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {lastMessage}
                        </p>
                        {isSpeaking && <p className="text-blue-500 mt-2">🤖 AI is speaking...</p>}
                        {isListening && <p className="text-green-500 mt-2">🎤 Listening… you can answer now</p>}
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center mt-4">
                {isInactiveOrFinished ? (
                    <button className="btn-call" onClick={startCall}>
                        Call
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={endCall}>
                        End
                    </button>
                )}
            </div>
        </>
    );
}
