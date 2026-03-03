import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { user, session as sessionTable } from '$lib/server/db/auth.schema';
import { eq, like, or, count, gt, and, lte, desc } from 'drizzle-orm';
import { auth } from '$lib/server/auth';

const PAGE_SIZE = 5;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(303, '/login');

	const [dbUser] = await db
		.select({ role: user.role })
		.from(user)
		.where(eq(user.id, locals.user.id))
		.limit(1);

	if (!dbUser || dbUser.role !== 'admin') {
		throw redirect(303, '/profile');
	}

	const currentPage = Math.max(1, Number(url.searchParams.get('page') || '1'));
	const search = url.searchParams.get('q') || '';
	const roleFilter = url.searchParams.get('role') || '';
	const statusFilter = url.searchParams.get('status') || '';

	// Build where conditions
	const conditions = [];

	if (search) {
		conditions.push(or(like(user.name, `%${search}%`), like(user.email, `%${search}%`)));
	}

	if (roleFilter && ['user', 'editor', 'admin'].includes(roleFilter)) {
		conditions.push(eq(user.role, roleFilter));
	}

	if (statusFilter === 'active') {
		conditions.push(and(eq(user.emailVerified, true), eq(user.banned, false)));
	} else if (statusFilter === 'pending') {
		conditions.push(eq(user.emailVerified, false));
	} else if (statusFilter === 'suspended') {
		conditions.push(eq(user.banned, true));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const users = await db
		.select()
		.from(user)
		.where(whereClause)
		.orderBy(desc(user.createdAt))
		.limit(PAGE_SIZE)
		.offset((currentPage - 1) * PAGE_SIZE);

	const [{ total }] = await db.select({ total: count() }).from(user).where(whereClause);

	// Active sessions count
	const [{ activeNow }] = await db
		.select({ activeNow: count() })
		.from(sessionTable)
		.where(gt(sessionTable.expiresAt, new Date()));

	// Signup trends: last 7 days vs previous 7 days
	const now = new Date();
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

	const [{ recentSignups }] = await db
		.select({ recentSignups: count() })
		.from(user)
		.where(gt(user.createdAt, sevenDaysAgo));

	const [{ previousSignups }] = await db
		.select({ previousSignups: count() })
		.from(user)
		.where(and(gt(user.createdAt, fourteenDaysAgo), lte(user.createdAt, sevenDaysAgo)));

	const signupTrendPercent =
		previousSignups > 0
			? Math.round(((recentSignups - previousSignups) / previousSignups) * 100 * 10) / 10
			: recentSignups > 0
				? 100
				: 0;

	// Counts per role
	const [{ adminCount }] = await db.select({ adminCount: count() }).from(user).where(eq(user.role, 'admin'));
	const [{ editorCount }] = await db.select({ editorCount: count() }).from(user).where(eq(user.role, 'editor'));
	const [{ suspendedCount }] = await db.select({ suspendedCount: count() }).from(user).where(eq(user.banned, true));
	const [{ pendingCount }] = await db.select({ pendingCount: count() }).from(user).where(eq(user.emailVerified, false));

	return {
		users,
		totalUsers: total,
		activeNow,
		signupTrendPercent,
		currentPage,
		totalPages: Math.ceil(total / PAGE_SIZE),
		pageSize: PAGE_SIZE,
		search,
		roleFilter,
		statusFilter,
		currentUser: locals.user,
		stats: {
			adminCount,
			editorCount,
			suspendedCount,
			pendingCount
		}
	};
};

export const actions: Actions = {
	addUser: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/login');
		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const email = (formData.get('email') as string)?.trim();
		const password = formData.get('password') as string;
		const role = (formData.get('role') as string) || 'user';

		if (!name || !email || !password) {
			return { error: 'Name, email, and password are required.' };
		}
		if (password.length < 8) {
			return { error: 'Password must be at least 8 characters.' };
		}
		if (!['user', 'editor', 'admin'].includes(role)) {
			return { error: 'Invalid role.' };
		}

		try {
			// Use better-auth API to create user (handles password hashing)
			const result = await auth.api.signUpEmail({
				body: { name, email, password }
			});

			if (!result?.user?.id) {
				return { error: 'Failed to create user.' };
			}

			// Set role if not default
			if (role !== 'user') {
				await db
					.update(user)
					.set({ role, updatedAt: new Date() })
					.where(eq(user.id, result.user.id));
			}

			return { success: true, message: `User ${email} created successfully.` };
		} catch (err: any) {
			const message = err?.message || 'Failed to create user.';
			if (message.includes('already') || message.includes('exists') || message.includes('unique')) {
				return { error: 'A user with this email already exists.' };
			}
			return { error: message };
		}
	},

	changeRole: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/login');
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const newRole = formData.get('role') as string;

		if (!['user', 'editor', 'admin'].includes(newRole)) {
			return { error: 'Invalid role' };
		}
		if (userId === locals.user.id) {
			return { error: 'Cannot change your own role' };
		}

		await db
			.update(user)
			.set({ role: newRole, updatedAt: new Date() })
			.where(eq(user.id, userId));

		return { success: true };
	},

	toggleBan: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/login');
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const ban = formData.get('action') === 'ban';
		const reason = (formData.get('reason') as string) || '';

		if (userId === locals.user.id) {
			return { error: 'Cannot ban yourself' };
		}

		await db
			.update(user)
			.set({
				banned: ban,
				bannedReason: ban ? (reason || null) : null,
				updatedAt: new Date()
			})
			.where(eq(user.id, userId));

		return { success: true };
	},

	deleteUser: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/login');
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (userId === locals.user.id) {
			return { error: 'Cannot delete yourself' };
		}

		await db.delete(user).where(eq(user.id, userId));
		return { success: true };
	}
};
