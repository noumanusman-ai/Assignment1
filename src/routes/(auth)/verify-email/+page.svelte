<script lang="ts">
	import { sendVerificationEmail } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const emailParam = $derived(new URLSearchParams(page.url.search).get('email'));
	const pending = $derived(new URLSearchParams(page.url.search).get('pending') === 'true');
	const verified = $derived(new URLSearchParams(page.url.search).get('verified') === 'true');

	let resendLoading = $state(false);
	let resendSuccess = $state(false);
	let countdown = $state(3);

	onMount(() => {
		if (verified) {
			const interval = setInterval(() => {
				countdown--;
				if (countdown <= 0) {
					clearInterval(interval);
					goto('/profile');
				}
			}, 1000);
			return () => clearInterval(interval);
		}
	});

	async function resendEmail() {
		if (!emailParam) return;
		resendLoading = true;
		resendSuccess = false;
		await sendVerificationEmail(emailParam, '/verify-email?verified=true');
		resendLoading = false;
		resendSuccess = true;
	}
</script>

<div class="glass-card rounded-xl p-8 shadow-2xl">
	{#if verified}
		<!-- Success state -->
		<div class="flex flex-col items-center gap-6 py-4">
			<div
				class="flex size-16 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/30"
			>
				<span class="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
			</div>
			<div class="text-center">
				<h2 class="mb-2 text-xl font-extrabold text-white">Email Verified!</h2>
				<p class="text-sm text-slate-400">
					Your email has been verified successfully.
				</p>
			</div>
			<p class="text-xs text-slate-500">
				Redirecting to your profile in {countdown}s...
			</p>
			<a
				href="/profile"
				class="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
			>
				<span>Go to Profile</span>
				<span class="material-symbols-outlined text-base">arrow_forward</span>
			</a>
		</div>
	{:else if pending}
		<!-- Pending gate state -->
		<div class="flex flex-col items-center gap-6 py-4">
			<div
				class="flex size-16 items-center justify-center rounded-full bg-amber-500/20 ring-2 ring-amber-500/30"
			>
				<span class="material-symbols-outlined text-4xl text-amber-400">shield</span>
			</div>
			<div class="text-center">
				<h2 class="mb-2 text-xl font-extrabold text-white">Verification Required</h2>
				<p class="text-sm text-slate-400">
					You need to verify your email address before accessing this page. Check your inbox for
					a verification link.
				</p>
			</div>
			<div class="flex w-full flex-col gap-3">
				<a
					href="/login"
					class="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
				>
					<span>Go to Login</span>
					<span class="material-symbols-outlined text-base">arrow_forward</span>
				</a>
			</div>
		</div>
	{:else}
		<!-- Post-signup state -->
		<div class="flex flex-col items-center gap-6 py-4">
			<div
				class="flex size-16 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30"
			>
				<span class="material-symbols-outlined text-4xl text-primary">mail</span>
			</div>
			<div class="text-center">
				<h2 class="mb-2 text-xl font-extrabold text-white">Check Your Inbox</h2>
				<p class="text-sm text-slate-400">
					{#if emailParam}
						We've sent a verification link to
						<span class="font-bold text-white">{emailParam}</span>.
					{:else}
						We've sent a verification link to your email address.
					{/if}
				</p>
			</div>
			<p class="text-center text-xs text-slate-500">
				Click the link in the email to verify your account. If you don't see it, check your spam
				folder.
			</p>
			{#if emailParam}
				<button
					onclick={resendEmail}
					disabled={resendLoading || resendSuccess}
					class="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50"
				>
					{#if resendSuccess}
						<span class="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
						<span class="text-emerald-400">Email sent!</span>
					{:else if resendLoading}
						<span>Sending...</span>
					{:else}
						<span class="material-symbols-outlined text-sm">refresh</span>
						<span>Resend verification email</span>
					{/if}
				</button>
			{/if}
			<a
				href="/login"
				class="text-xs font-bold text-primary hover:underline"
			>
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
