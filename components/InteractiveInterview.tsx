"use client";

import { useEffect, useState, useRef } from "react";
type SpeechRecognitionType = any;
export default function InteractiveInterview({ username }: { username: string }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const recognitionRef = useRef<SpeechRecognitionType | null>(null);

    const interviewQuestions = [
        {
            key: "greeting",
            text: `Hey ${username}, let's prepare for your interview. Are you ready?`,
            listen: true,
            optional: true,
        },
        { key: "role", text: "What role would you like to train for?", listen: true, required: true },
        { key: "type", text: "Are you aiming for a technical, behavioural or mixed interview?", listen: true, required: true },
        { key: "level", text: "What is your job experience level?", listen: true, required: true },
        { key: "techstack", text: "Please list the technologies you want to cover during the interview.", listen: true, required: true },
        { key: "amount", text: "How many questions would you like to generate?", listen: true, required: true },
    ];

    // Setup SpeechRecognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            const key = interviewQuestions[currentStep].key;
            setResponses(prev => ({ ...prev, [key]: transcript }));

            // Move to next step after listening
            setCurrentStep(prev => prev + 1);
        };

        recognitionRef.current = recognition;
    }, [currentStep]);

    // Speak the current question
    useEffect(() => {
        if (currentStep >= interviewQuestions.length) return; // done

        const currentQuestion = interviewQuestions[currentStep];
        const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);

        // Start listening if needed
        if (currentQuestion.listen) {
            setTimeout(() => recognitionRef.current?.start(), 1500);
        }
    }, [currentStep]);

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-6 px-4">
            {currentStep < interviewQuestions.length ? (
                <>
                    <p className="text-xl font-semibold">{interviewQuestions[currentStep].text}</p>
                    {interviewQuestions[currentStep].listen && <p className="text-gray-400">Listening...</p>}
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold">All done! Here are your responses:</h2>
                    <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(responses, null, 2)}</pre>
                </>
            )}
        </div>
    );
}
