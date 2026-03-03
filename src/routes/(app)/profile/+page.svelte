<script lang="ts">
	import { enhance } from '$app/forms';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { data, form } = $props();
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	// Password state
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordLoading = $state(false);
	let passwordError = $state('');
	let passwordSuccess = $state(false);

	// Delete account state
	let showDeleteConfirm = $state(false);
	let deleteLoading = $state(false);
	let deleteError = $state('');

	async function logout() {
		await authClient.signOut();
		goto('/login');
	}

	async function updatePassword() {
		passwordError = '';
		passwordSuccess = false;

		if (newPassword !== confirmPassword) {
			passwordError = 'Passwords do not match.';
			return;
		}
		if (newPassword.length < 8) {
			passwordError = 'Password must be at least 8 characters.';
			return;
		}

		passwordLoading = true;
		const { error: err } = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true
		});
		passwordLoading = false;

		if (err) {
			passwordError = err.message || 'Failed to update password.';
		} else {
			passwordSuccess = true;
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		}
	}

	async function deleteAccount() {
		deleteLoading = true;
		deleteError = '';
		const { error: err } = await authClient.deleteUser();
		deleteLoading = false;

		if (err) {
			deleteError = err.message || 'Failed to delete account.';
		} else {
			goto('/login');
		}
	}
</script>

<svelte:head>
	<title>Profile Settings | NexusID</title>
</svelte:head>

<div
	class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100"
>
	<header
		class="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-slate-200 bg-white/5 px-6 py-4 whitespace-nowrap backdrop-blur-md md:px-10 dark:border-primary/20"
	>
		<a href="/" class="flex items-center gap-3">
			<div class="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
				<span class="material-symbols-outlined text-2xl">fingerprint</span>
			</div>
			<h2 class="text-xl leading-tight font-bold tracking-tight text-slate-900 dark:text-white">
				NexusID
			</h2>
		</a>
		<div class="hidden flex-1 justify-center gap-8 md:flex">
			<a
				class="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300 dark:hover:text-primary"
				href="/">Home</a
			>
			<a class="border-b-2 border-primary pb-1 text-sm font-semibold text-primary" href="/profile"
				>Profile</a
			>
		</div>
		<div class="flex items-center gap-4">
			<button
				onclick={logout}
				class="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold transition-all hover:bg-red-500 hover:text-white dark:bg-slate-800"
			>
				Logout
			</button>
			<div
				class="aspect-square size-10 rounded-full border-2 border-primary/30 bg-cover bg-center bg-no-repeat"
				style:background-image="url({data.user.image || `https://avatar.vercel.sh/${data.user.email}`})"
			></div>
		</div>
	</header>

	<main class="flex flex-1 justify-center px-4 py-10 md:px-0">
		<div class="flex max-w-[800px] flex-1 flex-col gap-8">
			<div class="flex flex-col gap-2">
				<h1 class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
					Profile Settings
				</h1>
				<p class="text-lg text-slate-500 dark:text-slate-400">
					Manage your digital identity and security preferences.
				</p>
			</div>

			<div class="flex flex-col gap-6">
				<!-- Profile Form -->
				<section
					class="rounded-xl border border-slate-200 bg-white p-6 shadow-xl backdrop-blur-sm md:p-8 dark:border-primary/10 dark:bg-slate-950/40"
				>
					<div class="mb-8 flex items-center gap-3">
						<span class="material-symbols-outlined text-primary">person</span>
						<h2 class="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h2>
					</div>

					<form
						method="POST"
						action="?/updateProfile"
						use:enhance={() => {
							loading = true;
							error = '';
							success = false;
							return async ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									success = true;
								} else {
									error = 'Failed to update profile.';
								}
							};
						}}
						class="grid grid-cols-1 gap-6 md:grid-cols-2"
					>
						<div
							class="col-span-1 flex flex-col items-center gap-6 border-b border-slate-100 pb-6 md:col-span-2 md:flex-row dark:border-slate-800"
						>
							<div class="relative">
								<div
									class="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10"
								>
									<img
										class="h-full w-full object-cover"
										src={data.user.image || 'https://avatar.vercel.sh/' + data.user.email}
										alt="User Avatar"
									/>
								</div>
								<button
									type="button"
									class="absolute right-0 bottom-0 rounded-full border-2 border-white bg-primary p-1.5 text-white shadow-lg dark:border-slate-950"
								>
									<span class="material-symbols-outlined text-sm">edit</span>
								</button>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-slate-900 dark:text-white">Profile Photo</h3>
								<p class="text-sm text-slate-500 dark:text-slate-400">
									Upload a new photo to represent you in the community.
								</p>
							</div>
						</div>

						<div class="flex flex-col gap-2">
							<label for="name" class="text-sm font-semibold text-slate-700 dark:text-slate-300"
								>Display Name</label
							>
							<input
								id="name"
								name="name"
								class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
								placeholder="e.g. Alex Rivers"
								type="text"
								value={data.user.name}
								required
							/>
						</div>

						<div class="flex flex-col gap-2">
							<label for="email" class="text-sm font-semibold text-slate-700 dark:text-slate-300"
								>Email Address</label
							>
							<input
								id="email"
								class="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 font-medium text-slate-400 italic dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500"
								readonly
								type="email"
								value={data.user.email}
							/>
						</div>

						<div class="col-span-1 flex flex-col gap-2 md:col-span-2">
							<label for="image" class="text-sm font-semibold text-slate-700 dark:text-slate-300"
								>Avatar URL</label
							>
							<input
								id="image"
								name="image"
								class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
								placeholder="https://..."
								type="text"
								value={data.user.image}
							/>
						</div>

						<div class="col-span-1 mt-4 flex items-center justify-between md:col-span-2">
							<div class="flex flex-col">
								{#if error}
									<p class="text-sm font-medium text-red-500">{error}</p>
								{/if}
								{#if success}
									<p class="text-sm font-medium text-green-500">Profile updated successfully!</p>
								{/if}
							</div>
							<button
								disabled={loading}
								type="submit"
								class="flex items-center gap-3 rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
							>
								{#if loading}
									<svg
										class="h-5 w-5 animate-spin text-white"
										fill="none"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											fill="currentColor"
										></path>
									</svg>
								{/if}
								Save Changes
							</button>
						</div>
					</form>
				</section>

				<!-- Security / Change Password -->
				<section
					class="rounded-xl border border-slate-200 bg-white p-6 shadow-xl backdrop-blur-sm md:p-8 dark:border-primary/10 dark:bg-slate-950/40"
				>
					<div class="mb-8 flex items-center gap-3">
						<span class="material-symbols-outlined text-primary">security</span>
						<h2 class="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
					</div>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div class="col-span-1 flex flex-col gap-2 md:col-span-2">
							<label
								for="current-password"
								class="text-sm font-semibold text-slate-700 dark:text-slate-300"
								>Current Password</label
							>
							<div class="relative">
								<input
									id="current-password"
									bind:value={currentPassword}
									class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
									placeholder="••••••••"
									type="password"
								/>
							</div>
						</div>
						<div class="flex flex-col gap-2">
							<label
								for="new-password"
								class="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label
							>
							<input
								id="new-password"
								bind:value={newPassword}
								class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
								placeholder="Minimum 8 chars"
								type="password"
							/>
						</div>
						<div class="flex flex-col gap-2">
							<label
								for="confirm-password"
								class="text-sm font-semibold text-slate-700 dark:text-slate-300"
								>Confirm New Password</label
							>
							<input
								id="confirm-password"
								bind:value={confirmPassword}
								class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
								placeholder="Repeat password"
								type="password"
							/>
						</div>
					</div>
					{#if passwordError}
						<p class="mt-4 text-sm font-medium text-red-500">{passwordError}</p>
					{/if}
					{#if passwordSuccess}
						<p class="mt-4 text-sm font-medium text-green-500">Password updated successfully!</p>
					{/if}
					<div class="mt-8 flex justify-end gap-4">
						<button
							type="button"
							onclick={() => { currentPassword = ''; newPassword = ''; confirmPassword = ''; passwordError = ''; passwordSuccess = false; }}
							class="rounded-lg px-6 py-3 font-bold text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
							>Cancel</button
						>
						<button
							type="button"
							disabled={passwordLoading}
							onclick={updatePassword}
							class="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/20 px-8 py-3 font-bold text-primary transition-all hover:bg-primary/30 disabled:opacity-50"
						>
							{#if passwordLoading}
								<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
								</svg>
							{/if}
							Update Password
						</button>
					</div>
				</section>

				<!-- Danger Zone / Delete Account -->
				<div
					class="mb-10 flex flex-col items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-6 md:flex-row"
				>
					<div>
						<h3 class="font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
						<p class="text-sm text-slate-500 dark:text-slate-400">
							Once you delete your account, there is no going back. Please be certain.
						</p>
					</div>
					{#if !showDeleteConfirm}
						<button
							onclick={() => showDeleteConfirm = true}
							class="rounded-lg bg-red-500 px-6 py-2 font-bold whitespace-nowrap text-white transition-colors hover:bg-red-600"
							>Delete Account</button
						>
					{:else}
						<div class="flex flex-col items-end gap-2">
							{#if deleteError}
								<p class="text-sm font-medium text-red-500">{deleteError}</p>
							{/if}
							<div class="flex gap-2">
								<button
									onclick={() => { showDeleteConfirm = false; deleteError = ''; }}
									class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
									>Cancel</button
								>
								<button
									disabled={deleteLoading}
									onclick={deleteAccount}
									class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
								>
									{#if deleteLoading}
										<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
										</svg>
									{/if}
									Yes, Delete My Account
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>
