'use server';

import { ListingAgent } from "@/agents/ListingAgent";
import { revalidatePath } from "next/cache";

export async function createListingAction(prevState: any, formData: FormData) {
    // ... (Same as before, not implemented for FormData yet)
    return { success: false, error: "Use client-side JSON submission" };
}

import { getCurrentUser } from "@/lib/auth";

// ...

// JSON Action
export async function submitListingJson(data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const agent = new ListingAgent();

        const rawData = {
            ...data,
            agentId: user.id,
            // Ensure array defaults if missing
            features: { ...data.features },
            location: { ...data.location }
        };

        let newId;
        if (data.id) {
            await agent.updateListing(data.id, rawData);
            newId = data.id;
        } else {
            newId = await agent.createListing(rawData);
        }

        revalidatePath('/properties');
        revalidatePath('/dashboard');
        revalidatePath('/');

        return { success: true, listingId: newId };
    } catch (e) {
        console.error("Submit Error:", e);
        return { success: false, error: (e instanceof Error) ? e.message : "Failed to create listing" };
    }
}
