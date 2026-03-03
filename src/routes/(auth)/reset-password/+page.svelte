<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}
		if (newPassword.length < 8) {
			error = 'Password must be at least 8 characters.';
			return;
		}

		loading = true;
		const token = new URLSearchParams(page.url.search).get('token') || '';
		const res = await fetch('/api/auth/reset-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ newPassword, token }),
			credentials: 'include'
		});
		loading = false;

		if (!res.ok) {
			const data = await res.json().catch(() => null);
			error = data?.message || 'Failed to reset password. The link may have expired.';
		} else {
			success = true;
		}
	}
</script>

<svelte:head>
	<title>Reset Password | NexusID</title>
</svelte:head>

<div class="glass-card rounded-xl p-8 shadow-2xl">
	{#if success}
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="flex size-16 items-center justify-center rounded-full bg-green-500/10">
				<span class="material-symbols-outlined text-4xl text-green-400">check_circle</span>
			</div>
			<h2 class="text-xl font-bold text-white">Password reset!</h2>
			<p class="text-sm text-slate-400">
				Your password has been successfully updated. You can now sign in with your new password.
			</p>
			<a
				href="/login"
				class="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
			>
				<span>Sign In</span>
				<span class="material-symbols-outlined text-base">arrow_forward</span>
			</a>
		</div>
	{:else}
		<div class="mb-6 flex flex-col gap-2">
			<h2 class="text-xl font-bold text-white">Set new password</h2>
			<p class="text-sm text-slate-400">
				Enter your new password below.
			</p>
		</div>

		<form onsubmit={handleSubmit} class="flex flex-col gap-5">
			{#if error}
				<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-500">
					{error}
				</div>
			{/if}
			<div class="flex flex-col gap-2">
				<label class="px-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
					New Password
				</label>
				<div class="relative">
					<span class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400">lock</span>
					<input
						bind:value={newPassword}
						class="h-12 w-full rounded-lg border border-slate-200 bg-white/50 pr-4 pl-10 transition-all outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-primary/5 dark:placeholder:text-slate-600"
						placeholder="Minimum 8 characters"
						type="password"
						required
					/>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<label class="px-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
					Confirm Password
				</label>
				<div class="relative">
					<span class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400">lock</span>
					<input
						bind:value={confirmPassword}
						class="h-12 w-full rounded-lg border border-slate-200 bg-white/50 pr-4 pl-10 transition-all outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-primary/5 dark:placeholder:text-slate-600"
						placeholder="Repeat password"
						type="password"
						required
					/>
				</div>
			</div>
			<button
				disabled={loading}
				class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50"
				type="submit"
			>
				{#if loading}
					<span>Resetting...</span>
				{:else}
					<span>Reset Password</span>
					<span class="material-symbols-outlined text-base">arrow_forward</span>
				{/if}
			</button>
		</form>
	{/if}
</div>

<style>
	.glass-card {
		background: rgba(41, 35, 72, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(155, 146, 201, 0.2);
	}
</style>
