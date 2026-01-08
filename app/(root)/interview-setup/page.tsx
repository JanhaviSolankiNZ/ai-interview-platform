import React from 'react'
import InterviewSetupForm from "@/components/InterviewSetupForm";
import {getCurrentUser} from "@/lib/actions/auth.action";

const InterviewSetup = async () => {
    const user = await getCurrentUser();
    return (
        <InterviewSetupForm userName={user?.name || "User"} userId={user?.id || null} />
    )
}
export default InterviewSetup
