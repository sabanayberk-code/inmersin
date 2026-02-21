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

        console.log("[submitListingJson] Received data:", JSON.stringify(data, null, 2));

        const rawData = {
            ...data,
            agentId: user.id,
            // Explicitly ensure critical fields are passed
            title: data.title,
            description: data.description,
            images: data.images,
            type: data.type,
            // Ensure array defaults if missing
            features: { ...data.features },
            location: { ...data.location }
        };

        let result;
        if (data.id) {
            await agent.updateListing(data.id, rawData, data.locale);
            result = { id: data.id };
        } else {
            result = await agent.createListing(rawData as any);
        }

        revalidatePath('/properties');
        revalidatePath('/dashboard');
        revalidatePath('/');

        return { success: true, listingId: result.id, serialCode: (result as any).serialCode };
    } catch (e) {
        console.error("Submit Error:", e);
        return { success: false, error: (e instanceof Error) ? e.message : "Failed to create listing" };
    }
}
