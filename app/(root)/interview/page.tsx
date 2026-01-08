import React from 'react'
import Agent from '@/components/Agent';
import {getCurrentUser} from "@/lib/actions/auth.action";
import AIInterview from "@/components/AIInterview";

const Page = async() => {
    const user = await getCurrentUser();
    return (
        <>
        <h3>Interview</h3>
            <AIInterview userName={user?.name || "User"} />
        </>
    )
}
export default Page
