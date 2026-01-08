export class SpeechEngine {
    private recognition: any;
    private onFinalTranscript: (text: string) => void;
    private transcriptBuffer: string = "";
    private silenceTimeout: any;

    constructor(
        onFinalTranscript: (text: string) => void,
        private options?: {
            onSpeakingChange?: (v: boolean) => void;
            onListeningChange?: (v: boolean) => void;
        }
    ) {
        this.onFinalTranscript = onFinalTranscript;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = "en-US";
        this.recognition.interimResults = true;
        this.recognition.continuous = true;

        this.recognition.onstart = () => this.options?.onListeningChange?.(true);
        this.recognition.onend = () => this.options?.onListeningChange?.(false);

        this.recognition.onresult = (event: any) => {
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    this.transcriptBuffer += result[0].transcript + " ";
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Reset silence timer on every new speech
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = setTimeout(() => {
                const finalText = this.transcriptBuffer.trim();
                if (finalText.length > 0) {
                    this.onFinalTranscript(finalText);
                    this.transcriptBuffer = "";
                }
            }, 1500); // stop after 1.5s of silence
        };

        this.recognition.onerror = (err: any) => console.log("STT Error:", err);
    }

    async speak(text: string) {
        return new Promise<void>((resolve) => {
            this.options?.onSpeakingChange?.(true);

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";

            utterance.onend = () => {
                this.options?.onSpeakingChange?.(false);
                resolve();
            };

            speechSynthesis.speak(utterance);
        });
    }

    startListening() {
        try {
            this.recognition.start();
        } catch (e) {
            console.log("Recognition already started");
        }
    }

    stopListening() {
        clearTimeout(this.silenceTimeout);
        this.recognition.stop();
    }

    destroy() {
        this.stopListening();
        window.speechSynthesis.cancel();
    }
}
