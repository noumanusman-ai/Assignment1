<script lang="ts">
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let loading = $state(false);
	let error = $state('');
	let sent = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';

		const res = await fetch('/api/auth/request-password-reset', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, redirectTo: '/reset-password' }),
			credentials: 'include'
		});
		loading = false;

		if (!res.ok) {
			const data = await res.json().catch(() => null);
			error = data?.message || 'Failed to send reset email. Please try again.';
		} else {
			sent = true;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password | NexusID</title>
</svelte:head>

<div class="glass-card rounded-xl p-8 shadow-2xl">
	{#if sent}
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="flex size-16 items-center justify-center rounded-full bg-green-500/10">
				<span class="material-symbols-outlined text-4xl text-green-400">mark_email_read</span>
			</div>
			<h2 class="text-xl font-bold text-white">Check your email</h2>
			<p class="text-sm text-slate-400">
				If an account exists for <span class="font-semibold text-slate-300">{email}</span>, we've sent a password reset link.
			</p>
			<a
				href="/login"
				class="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline"
			>
				<span class="material-symbols-outlined text-base">arrow_back</span>
				Back to Login
			</a>
		</div>
	{:else}
		<div class="mb-6 flex flex-col gap-2">
			<h2 class="text-xl font-bold text-white">Forgot your password?</h2>
			<p class="text-sm text-slate-400">
				Enter your email address and we'll send you a link to reset your password.
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
					Email Address
				</label>
				<div class="relative">
					<span class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400">mail</span>
					<input
						bind:value={email}
						class="h-12 w-full rounded-lg border border-slate-200 bg-white/50 pr-4 pl-10 transition-all outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-primary/5 dark:placeholder:text-slate-600"
						placeholder="name@nexus.com"
						type="email"
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
					<span>Sending...</span>
				{:else}
					<span>Send Reset Link</span>
					<span class="material-symbols-outlined text-base">arrow_forward</span>
				{/if}
			</button>
		</form>

		<div class="mt-6 text-center">
			<a href="/login" class="text-sm font-bold text-primary hover:underline">
				Back to Login
			</a>
		</div>
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
