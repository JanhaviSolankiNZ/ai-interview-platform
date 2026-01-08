import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        console.log("Received file:", file.name, file.size);

        if (!file) return NextResponse.json({ error: "No file sent" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const tempPath = path.resolve("temp_answer.wav");
        console.log("Saving to:", tempPath);
        fs.writeFileSync(tempPath, buffer);

        return new Promise((resolve) => {
            const whisperProcess = spawn("whisper", [
                tempPath,
                "--model",
                "small",
                "--language",
                "en",
                "--output_format",
                "txt",
            ]);

            let stdout = "";
            whisperProcess.stdout.on("data", (data) => {
                console.log("Whisper output chunk:", data.toString());
                stdout += data.toString();
            });

            whisperProcess.on("close", () => {
                fs.unlinkSync(tempPath);
                console.log("Whisper exit code:", stdout.trim());
                resolve(NextResponse.json({ text: stdout.trim() || "not_answered" }));
            });
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
