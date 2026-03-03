import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Only redirect verified users away from auth pages
	// Unverified users must be able to access /login, /signup, /verify-email
	if (locals.user && locals.user.emailVerified) {
		throw redirect(303, '/profile');
	}
};
