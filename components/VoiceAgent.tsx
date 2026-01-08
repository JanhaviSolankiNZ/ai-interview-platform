"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
    questions: string[];
};

type Answer = {
    question: string;
    answer: string | null;
    status: "answered" | "not_answered";
};

export default function VoiceQuestionAgent({ questions }: Props) {
    /* -----------------------------
       STATE
    ------------------------------ */
    const [hasStarted, setHasStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [answers, setAnswers] = useState<Answer[]>([]);

    /* -----------------------------
       REFS (no re-render)
    ------------------------------ */
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<any>(null);
    const questionHandledRef = useRef(false); // 🔑 lock

    /* -----------------------------
       INIT SPEECH RECOGNITION
    ------------------------------ */
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            handleAnswer(transcript);
        };

        recognition.onerror = () => {
            stopListening();
        };

        recognitionRef.current = recognition;
    }, []);

    /* -----------------------------
       SPEAK WHEN INDEX CHANGES
    ------------------------------ */
    useEffect(() => {
        if (!hasStarted) return;
        if (currentIndex >= questions.length) return;

        speakQuestion(questions[currentIndex]);
    }, [hasStarted, currentIndex]);

    /* -----------------------------
       SPEAK QUESTION
    ------------------------------ */
    const speakQuestion = (text: string) => {
        questionHandledRef.current = false; // reset lock

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => setIsSpeaking(true);

        utterance.onend = () => {
            setIsSpeaking(false);
            startListening();
        };

        window.speechSynthesis.speak(utterance);
    };

    /* -----------------------------
       START LISTENING + TIMER
    ------------------------------ */
    const startListening = () => {
        if (!recognitionRef.current) return;

        setIsListening(true);
        recognitionRef.current.start();

        silenceTimerRef.current = setTimeout(() => {
            handleNoAnswer();
        }, 10000); // 10 seconds
    };

    /* -----------------------------
       STOP LISTENING
    ------------------------------ */
    const stopListening = () => {
        recognitionRef.current?.stop();
        clearTimeout(silenceTimerRef.current);
        setIsListening(false);
    };

    /* -----------------------------
       HANDLE ANSWER
    ------------------------------ */
    const handleAnswer = (answerText: string) => {
        if (questionHandledRef.current) return;
        questionHandledRef.current = true;

        stopListening();

        setAnswers((prev) => [
            ...prev,
            {
                question: questions[currentIndex],
                answer: answerText,
                status: "answered",
            },
        ]);

        moveToNext();
    };

    /* -----------------------------
       HANDLE NO ANSWER
    ------------------------------ */
    const handleNoAnswer = () => {
        if (questionHandledRef.current) return;
        questionHandledRef.current = true;

        stopListening();

        setAnswers((prev) => [
            ...prev,
            {
                question: questions[currentIndex],
                answer: null,
                status: "not_answered",
            },
        ]);

        moveToNext();
    };

    /* -----------------------------
       NEXT QUESTION
    ------------------------------ */
    const moveToNext = () => {
        setCurrentIndex((prev) => prev + 1);
    };

    /* -----------------------------
       START INTERVIEW
    ------------------------------ */
    const handleStart = () => {
        setHasStarted(true);
        setCurrentIndex(0);
        setAnswers([]);
    };

    /* -----------------------------
       UI
    ------------------------------ */
    return (
        <div style={{ padding: 20, maxWidth: 500 }}>
            <h2>🎙️ Voice Question Agent</h2>

            {!hasStarted && (
                <button onClick={handleStart}>
                    ▶️ Start Interview
                </button>
            )}

            {hasStarted && currentIndex < questions.length && (
                <>
                    <p>
                        <strong>Question {currentIndex + 1}:</strong>{" "}
                        {questions[currentIndex]}
                    </p>

                    {isSpeaking && <p>🗣️ Agent is speaking...</p>}
                    {isListening && (
                        <p style={{ color: "green" }}>
                            🎤 Listening… you can answer now
                        </p>
                    )}
                </>
            )}

            {hasStarted && currentIndex >= questions.length && (
                <>
                    <h3>✅ Interview Completed</h3>
                    <pre>{JSON.stringify(answers, null, 2)}</pre>
                </>
            )}
        </div>
    );
}
