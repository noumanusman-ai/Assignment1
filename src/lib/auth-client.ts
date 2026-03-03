import { createAuthClient } from "better-auth/svelte"

export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : undefined
})

export async function sendVerificationEmail(email: string, callbackURL?: string) {
    return authClient.sendVerificationEmail({
        email,
        callbackURL: callbackURL ?? "/"
    });
}
