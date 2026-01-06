import {getRandomInterviewCover} from "@/lib/utils";
import {db} from "@/firebase/admin";
import {generateInterviewQuestions} from "@/lib/ollama";

export async function GET() {
    return Response.json({success: true, data: "Thank you!"}, {status: 200});
}

export async function POST(request: Request) {
    const {type, role, level, techstack, amount, userid} =
        await request.json();

    try {
        const prompt = `
Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.

Rules:
- Return ONLY a valid JSON array
- No markdown
- No special characters like *, /, -
- Suitable for voice assistant
- Format exactly like:
["Question 1", "Question 2"]

Start now.
`;

        const questionsText = await generateInterviewQuestions(prompt);
        const cleanJson = questionsText.match(/\[[\s\S]*\]/)?.[0];
        const questions = JSON.parse(cleanJson || "[]");
        console.log(questions);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("AI did not return valid questions");
        }

        if (!userid) {
            throw new Error("User ID is missing");
        }

        const interview = {
            role,
            type,
            level,
            techstack: techstack.split(","),
            questions,
            finalized: true,
            created_at: new Date().toISOString(),
            coverImage: getRandomInterviewCover(),
            userId: userid,
        };

        await db.collection("interviews").add(interview);

        return Response.json({success: true}, {status: 200});
    } catch (err) {
        console.error(err);
        return Response.json(
            {success: false, error: "Failed to generate interview"},
            {status: 500}
        );
    }
}
