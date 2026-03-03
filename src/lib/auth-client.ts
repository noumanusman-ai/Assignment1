import { createAuthClient } from "better-auth/svelte"

export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : undefined
})

export async function sendVerificationEmail(email: string, callbackURL?: string) {
    const baseURL = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${baseURL}/api/auth/send-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackURL }),
        credentials: "include"
    });
    return res.json();
}
