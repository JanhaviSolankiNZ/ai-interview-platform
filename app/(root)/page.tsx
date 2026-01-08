import {Button} from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import Link from "next/link";
import Image from "next/image";
import {dummyInterviews} from "@/constants";

export default function Home() {
  return (<>
    <section className="card-cta">
      <div className="flex flex-col gap-6 max-w-lg">
        <h2>Get Interview-Ready with AI-Powered Practise & Feedback</h2>
        <p className="text-lg">
          Practise on real interview questions & get instant feedback
        </p>
        <Button asChild className="btn-primary max-sm:w-full">
          <Link href="/interview-setup">Start an Interview</Link>
        </Button>
      </div>
      <Image src="/robot.png" width={400} height={400} alt={"robot"} className="max-sm:hidden" />
    </section>
    <section className="flex flex-col gap-6 mt-8">
      <h2>Your Interviews</h2>
      <div className="interviews-section">
        {dummyInterviews.map((interview) => (
                <InterviewCard {...interview} key={interview.id}/>
        ))}
        <p>You have&apos; taken any interviews yet</p>
      </div>
    </section>
    <section className="flex flex-col gap-6 mt-8">
      <h2>Take an Interview</h2>
      <div className="interviews-section">
        <p>There are no interviews available</p>
      </div>
    </section>
    </>);
}
