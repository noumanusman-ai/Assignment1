import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	let session = null;
	try {
		session = await auth.api.getSession({ headers: event.request.headers });
	} catch {
		console.log("No session Found")
	}

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	const pathname = event.url.pathname;

	// Admin role check
	if (session && pathname.startsWith('/admin')) {
		const { db } = await import('$lib/server/db');
		const { user: userTable } = await import('$lib/server/db/auth.schema');
		const { eq } = await import('drizzle-orm');

		const [dbUser] = await db.select({ role: userTable.role })
			.from(userTable)
			.where(eq(userTable.id, session.user.id))
			.limit(1);

		if (!dbUser || dbUser.role !== 'admin') {
			return new Response(null, {
				status: 303,
				headers: { location: '/profile' }
			});
		}
	}

	if (!session) {
		const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/admin');
		if (isProtectedRoute) {
			const redirectTo = pathname + event.url.search;
			return new Response(null, {
				status: 303,
				headers: {
					location: `/login?redirectTo=${encodeURIComponent(redirectTo)}`
				}
			});
		}
	}

	// Redirect unverified users away from protected routes
	if (session && !session.user.emailVerified) {
		const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/admin');
		const isExempt = pathname.startsWith('/verify-email') ||
			pathname.startsWith('/login') ||
			pathname.startsWith('/signup') ||
			pathname.startsWith('/api/');
		if (isProtectedRoute && !isExempt) {
			return new Response(null, {
				status: 303,
				headers: {
					location: '/verify-email?pending=true'
				}
			});
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
