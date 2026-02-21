'use server';

import { updateBrandRequestStatus } from '@/actions/brandRequests';
import { revalidatePath } from 'next/cache';

export async function approveBrandAction(id: number, formData?: FormData) {
    const res = await updateBrandRequestStatus(id, 'approved');
    if (res.success) {
        revalidatePath('/dashboard/brands');
    }
}

export async function rejectBrandAction(id: number, formData?: FormData) {
    const res = await updateBrandRequestStatus(id, 'rejected');
    if (res.success) {
        revalidatePath('/dashboard/brands');
    }
}
