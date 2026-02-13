export async function sendEmail(to: string, subject: string, body: string) {
    // In a real application, you would use a service like Resend, SendGrid, etc.
    // For this implementation, we will log the email to the console.

    console.log('--------------------------------------------------');
    console.log(`📧 SENDING EMAIL TO: ${to}`);
    console.log(`📝 SUBJECT: ${subject}`);
    console.log(`📄 BODY:`);
    console.log(body);
    console.log('--------------------------------------------------');
}
