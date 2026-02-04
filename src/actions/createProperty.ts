'use server';

import { PropertyListingAgent } from "@/agents/PropertyListingAgent";
import { propertyInputSchema } from "@/lib/validations/property";
import { revalidatePath } from "next/cache";

export async function createPropertyAction(prevState: any, formData: FormData) {
    try {
        // 1. Auth Check (Mock)
        // const session = await auth();
        // if (!session) throw new Error("Unauthorized");
        const mockAgentId = 1; // Temporary: We need a seeded user 1

        // 2. Extract Data
        // NOTE: In a real complex form, we might send JSON body, but sticking to FormData for now requires parsing logic.
        // For simplicity in this demo, let's assume the client sends a JSON string payload or we parse fields.
        // To keep it robust, let's expect the client to use `useFormStatus` or similar and send structured data?
        // Actually, let's just accept the raw object for now to keep the action API clean for testing, 
        // but typically Server Actions take FormData if used with <form>.
        // Let's assume we receive the object directly if called from client component via JS, 
        // OR we parse FormData if native.

        // For this implementation, I will treat it as a direct function call from a Client Component 
        // that has already structured the data (e.g. RHF `handleSubmit`).
        // BUT 'use server' with FormData is the standard.
        // Let's implement a JSON accepting action for easier integration with React Hook Form.

        throw new Error("Direct FormData not implemented. Use client-side JSON submission.");

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// Alternative: JSON Action
export async function submitPropertyJson(data: any) {
    try {
        const agent = new PropertyListingAgent();

        // Mock Auth injection
        const rawData = { ...data, agentId: 1 };

        const newId = await agent.createListing(rawData);

        revalidatePath('/properties');
        return { success: true, propertyId: newId };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to create listing" };
    }
}
