"use client"
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {
    Form
} from "@/components/ui/form";
import FormRadioGroup from "@/components/FormRadioGroup";
import FormSelect from "@/components/FormSelect";
import FormField from "@/components/FormField";
import { useRouter } from "next/navigation";


const interviewSetupFormSchema = z.object({
        role: z.string().min(1, "Role is required"),
        type: z.enum(["technical", "behavioural", "mixed"]),
        level: z.enum(["junior", "mid", "senior"]),
        techstack: z.string().min(1, "Tech stack is required"),
        amount: z.coerce.number().min(1, "At least 1 question"),
})

const InterviewSetupForm = ({userName, userId}: {userName: string, userId: string | null}) => {
    type FormInput = z.input<typeof interviewSetupFormSchema>;  // matches form values
    type FormOutput = z.output<typeof interviewSetupFormSchema>;
    const router = useRouter();
    const form = useForm<FormInput>({
        resolver: zodResolver(interviewSetupFormSchema),
        defaultValues: {
            role: "",
            type: undefined,
            level: undefined,
            techstack: "",
            amount: 1
        }
    });

    async function onSubmit(values: FormOutput){
        try{
            const { role, type, techstack, level, amount } = values;
            const result = await fetch(`http://localhost:3000/api/generate`, {method: "POST", body: JSON.stringify({role, type, techstack, level, amount, userid: userId})});
            const data = await result.json();
            const payload = encodeURIComponent(JSON.stringify(data.questions));
            router.push(`/interview?myPayload=${payload}`);
        }catch(error){
            console.log(error)
        }
    }
    console.log(form.formState.errors, form.getValues())
    return (
        <div className="card-border mx-auto lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <h2 className="text-primary-100"> Hey {userName}, let’s prepare for your interview 🚀</h2>
                <h4 className="text-primary-100 text-center">Answer a few questions to customize your interview experience.</h4>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(
                        onSubmit,
                        (errors) => console.log("Form Errors:", errors)
                    )} className="w-full space-y-6 mt-4 form">
                        <FormField
                            control={form.control}
                            name="role"
                            label="What role would you like to train for?"
                            placeholder="Role"
                        />
                        <FormRadioGroup
                            control={form.control}
                            name="type"
                            label="Which type of interview are you aiming for?"
                            options={[
                                { label: "Technical", value: "technical" },
                                { label: "Behavioural", value: "behavioural" },
                                { label: "Mixed", value: "mixed" },
                            ]}
                        />
                        <FormSelect
                            control={form.control}
                            name="level"
                            label="What is your job experience level?"
                            placeholder="Select experience level"
                            options={[
                                { label: "Junior", value: "junior" },
                                { label: "Mid-Level", value: "mid" },
                                { label: "Senior", value: "senior" },
                            ]}
                        />

                        <FormField
                            control={form.control}
                            name="techstack"
                            label="Please list the technologies you want to cover during the interview."
                            placeholder="React, Next.js, TypeScript"
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            label="How many questions would you like to generate?"
                            type="number"
                        />
                        <Button className="btn" type="submit">Submit</Button>
                    </form>

                </Form>
            </div>
        </div>
    )
}


export default InterviewSetupForm;