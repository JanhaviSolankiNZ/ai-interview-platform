'use client';
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SpeechEngine } from "@/lib/SpeechEngine";
import {cleanTranscript, cn} from "@/lib/utils";
import Image from "next/image";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

type Answer = {
    question: string;
    answer: string | null;
    status: "answered" | "not_answered";
};

export default function AIInterview({userName}:{userName: string}) {
    const searchParams = useSearchParams();
    const payloadParam = searchParams.get("myPayload");

    let questions: string[] = [];
    try {
        questions = payloadParam ? JSON.parse(decodeURIComponent(payloadParam)) : [];
    } catch (err) {
        console.error("Failed to parse questions:", err);
        questions = [];
    }
    const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [answers, setAnswers] = useState<Answer[]>([]);

    const currentQuestionIndex = useRef(0);
    const speechEngineRef = useRef<SpeechEngine | null>(null);
    const isInactiveOrFinished =
        callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    const askQuestion = async (index: number) => {
        const q = questions[index];

        await speechEngineRef.current?.speak(q);
        await speechEngineRef.current?.startListening();
    };

    const handleFinalTranscript = (rawText: string) => {
        const text = cleanTranscript(rawText);
        const index = currentQuestionIndex.current;
        const question = questions[index];

        const cleanText = text.trim();
        setAnswers((prev) => [...prev, {answer: cleanText, question, status: "answered"}])
        if (index + 1 < questions.length) {
            currentQuestionIndex.current += 1;
            setCurrentIndex(currentIndex + 1);
            askQuestion(currentQuestionIndex.current);
        } else {
            setCallStatus(CallStatus.FINISHED);
        }
    };

    useEffect(() => {
        speechEngineRef.current = new SpeechEngine(handleFinalTranscript, {
            onSpeakingChange: setIsSpeaking,
            onListeningChange: setIsListening,
        });

        return () => {
            // Disable microphone & cancel TTS on unmount
            speechEngineRef.current?.destroy();
            window.speechSynthesis.cancel();
        };
    }, []);

    const startInterview = async () => {
        setCallStatus(CallStatus.CONNECTING);

        setTimeout(async () => {
            setCallStatus(CallStatus.ACTIVE);
            await askQuestion(currentQuestionIndex.current);
        }, 500);
    };

    const endInterview = () => {
        setCallStatus(CallStatus.FINISHED);
        setAnswers([]);
        speechEngineRef.current?.stopListening();
        speechEngineRef.current?.destroy();
        setIsListening(false);
        setIsSpeaking(false);
        setCurrentIndex(0);
    };
    console.log("ANSWERS", answers, questions[currentIndex]);

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
            <div className="transcript-border">
                    <div className="transcript">
                        {callStatus === CallStatus.ACTIVE && <p
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {questions[currentIndex]}
                        </p>}
                        {isSpeaking && <p className="text-blue-500 mt-2">🤖 AI is speaking...</p>}
                        {isListening && <p className="text-green-500 mt-2">🎤 Listening… you can answer now</p>}
                    </div>
            </div>

            <div className="w-full flex justify-center mt-4">
                {isInactiveOrFinished ? (
                    <button className="btn-call" onClick={startInterview}>
                        Call
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={endInterview}>
                        End
                    </button>
                )}
            </div>
        </>
    );
}
