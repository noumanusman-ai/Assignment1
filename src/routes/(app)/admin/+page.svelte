<script lang="ts">
	import { enhance } from '$app/forms';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { data, form } = $props();
	let openMenu = $state<string | null>(null);
	let searchQuery = $state(data.search);

	// Add User modal
	let showAddUser = $state(false);
	let addUserLoading = $state(false);
	let addUserError = $state('');
	let addUserName = $state('');
	let addUserEmail = $state('');
	let addUserPassword = $state('');

	// Mobile menu
	let showMobileMenu = $state(false);

	// Filter panel
	let showFilters = $state(false);
	let filterStatus = $state(data.statusFilter);

	// Delete confirmation
	let deleteTarget = $state<{ id: string; email: string } | null>(null);

	// Ban reason dialog
	let banTarget = $state<{ id: string; email: string } | null>(null);
	let banReason = $state('');

	// Toast notifications
	let toasts = $state<Array<{ id: number; message: string; type: 'success' | 'error' }>>([]);
	let toastCounter = $state(0);

	function addToast(message: string, type: 'success' | 'error' = 'success') {
		const id = ++toastCounter;
		toasts = [...toasts, { id, message, type }];
		setTimeout(() => {
			toasts = toasts.filter((t) => t.id !== id);
		}, 4000);
	}

	// Show form action results as toasts
	$effect(() => {
		if (form?.success && form?.message) {
			addToast(form.message);
		} else if (form?.error) {
			addToast(form.error, 'error');
		}
	});

	function toggleMenu(userId: string) {
		openMenu = openMenu === userId ? null : userId;
	}

	function closeMenu() {
		openMenu = null;
	}

	async function logout() {
		await authClient.signOut();
		goto('/login');
	}

	function getStatus(u: { emailVerified: boolean; banned: boolean }) {
		if (u.banned) return { label: 'Suspended', color: 'red' };
		if (!u.emailVerified) return { label: 'Pending', color: 'amber' };
		return { label: 'Active', color: 'green' };
	}

	function formatDate(date: string | Date) {
		const d = new Date(date);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days === 0) return 'Joined today';
		if (days === 1) return 'Joined 1 day ago';
		if (days < 7) return `Joined ${days} days ago`;
		if (days < 30)
			return `Joined ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
		if (days < 365)
			return `Joined ${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
		return `Joined ${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`;
	}

	function shortId(id: string) {
		return '#NX-' + id.slice(0, 3).toUpperCase();
	}

	const startIdx = $derived((data.currentPage - 1) * data.pageSize + 1);
	const endIdx = $derived(Math.min(data.currentPage * data.pageSize, data.totalUsers));

	function resetAddUserForm() {
		addUserName = '';
		addUserEmail = '';
		addUserPassword = '';
		addUserError = '';
		addUserLoading = false;
	}

	function openAddUser() {
		resetAddUserForm();
		showAddUser = true;
	}

	function closeAddUser() {
		showAddUser = false;
		resetAddUserForm();
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (filterStatus) params.set('status', filterStatus);
		params.set('page', '1');
		goto(`/admin?${params.toString()}`);
		showFilters = false;
	}

	function clearFilters() {
		filterStatus = '';
		searchQuery = '';
		goto('/admin');
		showFilters = false;
	}

	function buildPageUrl(pageNum: number) {
		const params = new URLSearchParams();
		params.set('page', String(pageNum));
		if (data.search) params.set('q', data.search);
		if (data.statusFilter) params.set('status', data.statusFilter);
		return `/admin?${params.toString()}`;
	}

	const hasActiveFilters = $derived(!!data.statusFilter);
</script>

<svelte:head>
	<title>Admin Panel | NexusID</title>
</svelte:head>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex min-h-screen flex-col bg-[#0f0b1e] font-display text-slate-100"
	onclick={closeMenu}
>
	<!-- Toast Notifications -->
	{#if toasts.length > 0}
		<div class="fixed top-4 right-4 z-[100] flex flex-col gap-2">
			{#each toasts as toast (toast.id)}
				<div
					class="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-md {toast.type === 'success'
						? 'border-green-500/30 bg-green-500/10 text-green-400'
						: 'border-red-500/30 bg-red-500/10 text-red-400'}"
				>
					<span class="material-symbols-outlined text-base">
						{toast.type === 'success' ? 'check_circle' : 'error'}
					</span>
					{toast.message}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Header -->
	<header
		class="sticky top-0 z-50 border-b border-primary/20 bg-[#16112b]/80 backdrop-blur-md"
	>
		<div class="flex items-center justify-between px-4 py-3 md:px-10">
			<!-- Left: Logo + Search -->
			<div class="flex items-center gap-4 md:gap-6">
				<a href="/admin" class="flex items-center gap-2">
					<div
						class="flex size-8 items-center justify-center rounded-lg bg-primary text-white"
					>
						<span class="material-symbols-outlined text-xl">fingerprint</span>
					</div>
					<span class="text-lg font-bold text-white"
						>NexusID <span class="hidden font-normal text-slate-400 sm:inline">Admin</span></span
					>
				</a>
				<form method="GET" class="hidden lg:block" onsubmit={(e) => { e.preventDefault(); applyFilters(); }}>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-base text-slate-500"
							>search</span
						>
						<input
							name="q"
							bind:value={searchQuery}
							class="h-9 w-64 rounded-lg border border-slate-700/50 bg-slate-900/50 pr-4 pl-9 text-sm text-slate-300 outline-none placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
							placeholder="Search users by name or email..."
							type="text"
						/>
					</div>
				</form>
			</div>

			<!-- Right: Desktop nav -->
			<div class="hidden items-center gap-4 md:flex">
				<div class="relative">
					<button
						onclick={(e) => { e.stopPropagation(); }}
						class="relative text-slate-400 transition-colors hover:text-white"
						title="Pending verifications"
					>
						<span class="material-symbols-outlined text-xl">notifications</span>
						{#if data.stats.pendingCount > 0}
							<span
								class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
							>
								{data.stats.pendingCount > 9 ? '9+' : data.stats.pendingCount}
							</span>
						{/if}
					</button>
				</div>
				<div class="h-6 w-px bg-slate-700/50"></div>
				<div class="flex items-center gap-3">
					<div class="text-right">
						<p class="text-sm font-semibold text-white">{data.currentUser.name}</p>
						<p class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
							Super Admin
						</p>
					</div>
					<div
						class="size-9 rounded-full border-2 border-primary/30 bg-cover bg-center"
						style:background-image="url({data.currentUser.image ||
							`https://avatar.vercel.sh/${data.currentUser.email}`})"
					></div>
				</div>
				<button
					onclick={logout}
					class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary/80"
				>
					<span class="material-symbols-outlined text-sm">logout</span>
					Sign Out
				</button>
			</div>

			<!-- Right: Mobile hamburger -->
			<div class="flex items-center gap-3 md:hidden">
				<div class="relative">
					<button
						onclick={(e) => { e.stopPropagation(); }}
						class="relative text-slate-400 transition-colors hover:text-white"
						title="Pending verifications"
					>
						<span class="material-symbols-outlined text-xl">notifications</span>
						{#if data.stats.pendingCount > 0}
							<span
								class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
							>
								{data.stats.pendingCount > 9 ? '9+' : data.stats.pendingCount}
							</span>
						{/if}
					</button>
				</div>
				<button
					onclick={(e) => { e.stopPropagation(); showMobileMenu = !showMobileMenu; }}
					class="rounded-lg p-1 text-slate-400 transition-colors hover:text-white"
				>
					<span class="material-symbols-outlined text-2xl">
						{showMobileMenu ? 'close' : 'menu'}
					</span>
				</button>
			</div>
		</div>

		<!-- Mobile menu dropdown -->
		{#if showMobileMenu}
			<div class="border-t border-slate-700/30 px-4 py-4 md:hidden">
				<!-- Mobile search -->
				<form method="GET" class="mb-4 lg:hidden" onsubmit={(e) => { e.preventDefault(); showMobileMenu = false; applyFilters(); }}>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-base text-slate-500"
							>search</span
						>
						<input
							name="q"
							bind:value={searchQuery}
							class="h-10 w-full rounded-lg border border-slate-700/50 bg-slate-900/50 pr-4 pl-9 text-sm text-slate-300 outline-none placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
							placeholder="Search users by name or email..."
							type="text"
						/>
					</div>
				</form>

				<!-- User info -->
				<div class="mb-4 flex items-center gap-3 rounded-lg bg-slate-800/30 p-3">
					<div
						class="size-10 rounded-full border-2 border-primary/30 bg-cover bg-center"
						style:background-image="url({data.currentUser.image ||
							`https://avatar.vercel.sh/${data.currentUser.email}`})"
					></div>
					<div>
						<p class="text-sm font-semibold text-white">{data.currentUser.name}</p>
						<p class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
							Super Admin
						</p>
					</div>
				</div>

				<!-- Sign out -->
				<button
					onclick={() => { showMobileMenu = false; logout(); }}
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/80"
				>
					<span class="material-symbols-outlined text-sm">logout</span>
					Sign Out
				</button>
			</div>
		{/if}
	</header>

	<!-- Main Content -->
	<main class="flex-1 px-6 py-8 md:px-10">
		<!-- Stat Cards -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Total Users -->
			<div class="rounded-xl border border-slate-700/40 bg-[#16112b] p-6">
				<div class="mb-4 flex items-center justify-between">
					<div class="flex size-10 items-center justify-center rounded-lg bg-primary/10">
						<span class="material-symbols-outlined text-xl text-primary">group</span>
					</div>
					<span
						class="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400"
						>+12% MONTH</span
					>
				</div>
				<p class="text-sm text-slate-400">Total Users</p>
				<p class="text-3xl font-extrabold text-white">
					{data.totalUsers.toLocaleString()}
				</p>
			</div>

			<!-- Active Now -->
			<div class="rounded-xl border border-slate-700/40 bg-[#16112b] p-6">
				<div class="mb-4 flex items-center justify-between">
					<div
						class="flex size-10 items-center justify-center rounded-lg bg-amber-500/10"
					>
						<span class="material-symbols-outlined text-xl text-amber-400">bolt</span>
					</div>
					<span
						class="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400"
					>
						<span class="inline-block size-1.5 rounded-full bg-emerald-400"></span>
						LIVE
					</span>
				</div>
				<p class="text-sm text-slate-400">Active Now</p>
				<p class="text-3xl font-extrabold text-white">{data.activeNow}</p>
			</div>

			<!-- Signup Trends -->
			<div class="rounded-xl border border-slate-700/40 bg-[#16112b] p-6">
				<div class="mb-4 flex items-center justify-between">
					<div
						class="flex size-10 items-center justify-center rounded-lg bg-violet-500/10"
					>
						<span class="material-symbols-outlined text-xl text-violet-400"
							>trending_up</span
						>
					</div>
					<div class="flex gap-0.5">
						{#each Array(5) as _, i}
							<div
								class="w-1 rounded-full bg-primary/60"
								style:height="{8 + Math.random() * 16}px"
							></div>
						{/each}
					</div>
				</div>
				<p class="text-sm text-slate-400">Signup Trends</p>
				<p class="text-3xl font-extrabold text-white">
					{data.signupTrendPercent >= 0 ? '+' : ''}{data.signupTrendPercent}%
				</p>
			</div>
		</div>

		<!-- Table Header -->
		<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<h2 class="text-2xl font-extrabold text-white">Registered Users</h2>
				<p class="text-sm text-slate-400">
					Manage all accounts and security privileges.
				</p>
			</div>
			<div class="flex gap-3">
				<div class="relative">
					<button
						onclick={(e) => {
							e.stopPropagation();
							showFilters = !showFilters;
						}}
						class="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700/50 {hasActiveFilters
							? 'border-primary/50 text-primary'
							: ''}"
					>
						<span class="material-symbols-outlined text-base">tune</span>
						Filter
						{#if hasActiveFilters}
							<span
								class="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
							>
								1
							</span>
						{/if}
					</button>

					<!-- Filter Dropdown -->
					{#if showFilters}
						<div
							class="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-700/50 bg-[#1e1a3b] p-5 shadow-2xl"
							onclick={(e) => e.stopPropagation()}
						>
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-sm font-bold text-white">Filters</h3>
								{#if hasActiveFilters}
									<button
										onclick={clearFilters}
										class="text-xs font-semibold text-primary hover:underline"
									>
										Clear all
									</button>
								{/if}
							</div>

							<!-- Status Filter -->
							<div class="mb-5">
								<label
									class="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase"
									for="filter-status">Status</label
								>
								<div class="flex flex-wrap gap-2">
									{#each [{ value: '', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'suspended', label: 'Suspended' }] as opt}
										<button
											onclick={() => (filterStatus = opt.value)}
											class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {filterStatus === opt.value
												? 'bg-primary text-white'
												: 'bg-slate-800/80 text-slate-400 hover:text-white'}"
										>
											{opt.label}
										</button>
									{/each}
								</div>
							</div>

							<button
								onclick={applyFilters}
								class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90"
							>
								<span class="material-symbols-outlined text-base">filter_alt</span>
								Apply Filters
							</button>
						</div>
					{/if}
				</div>
				<button
					onclick={openAddUser}
					class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
				>
					<span class="material-symbols-outlined text-base">add</span>
					Add User
				</button>
			</div>
		</div>

		<!-- Active filter badges -->
		{#if hasActiveFilters}
			<div class="mb-4 flex flex-wrap items-center gap-2">
				<span class="text-xs text-slate-500">Active filters:</span>
				{#if data.statusFilter}
					<span
						class="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
					>
						Status: {data.statusFilter}
						<button
							onclick={() => {
								filterStatus = '';
								applyFilters();
							}}
							class="ml-1 hover:text-white"
						>
							<span class="material-symbols-outlined text-sm">close</span>
						</button>
					</span>
				{/if}
			</div>
		{/if}

		<!-- Users Table -->
		<div class="overflow-hidden rounded-xl border border-slate-700/40 bg-[#16112b]">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-slate-700/40">
							<th
								class="px-6 py-4 text-left text-xs font-bold tracking-wider text-slate-500 uppercase"
								>User ID</th
							>
							<th
								class="px-6 py-4 text-left text-xs font-bold tracking-wider text-slate-500 uppercase"
								>Email</th
							>
							<th
								class="px-6 py-4 text-left text-xs font-bold tracking-wider text-slate-500 uppercase"
								>Role</th
							>
							<th
								class="px-6 py-4 text-left text-xs font-bold tracking-wider text-slate-500 uppercase"
								>Status</th
							>
							<th
								class="px-6 py-4 text-right text-xs font-bold tracking-wider text-slate-500 uppercase"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody>
						{#each data.users as u, i (u.id)}
							{@const status = getStatus(u)}
							<tr
								class="border-b border-slate-700/20 transition-colors last:border-0 hover:bg-slate-800/30"
							>
								<td class="px-6 py-4">
									<span class="text-sm font-medium text-slate-400"
										>{shortId(u.id)}</span
									>
								</td>
								<td class="px-6 py-4">
									<div>
										<p class="text-sm font-semibold text-white">{u.email}</p>
										<p class="text-xs text-slate-500">
											{formatDate(u.createdAt)}
										</p>
									</div>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-block rounded-md border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-400"
										>User</span
									>
								</td>
								<td class="px-6 py-4">
									{#if status.color === 'green'}
										<span
											class="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400"
										>
											<span
												class="inline-block size-1.5 rounded-full bg-green-400"
											></span>
											{status.label}
										</span>
									{:else if status.color === 'amber'}
										<span
											class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400"
										>
											<span
												class="inline-block size-1.5 rounded-full bg-amber-400"
											></span>
											{status.label}
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400"
										>
											<span
												class="inline-block size-1.5 rounded-full bg-red-400"
											></span>
											{status.label}
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-right">
									<div class="relative inline-block">
										<button
											onclick={(e) => {
												e.stopPropagation();
												toggleMenu(u.id);
											}}
											class="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
										>
											<span class="material-symbols-outlined text-xl"
												>more_vert</span
											>
										</button>
										{#if openMenu === u.id}
											<div
												class="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-lg border border-slate-700/50 bg-[#1e1a3b] shadow-xl"
												onclick={(e) => e.stopPropagation()}
											>
												{#if u.id !== data.currentUser.id}
													<!-- Ban/Unban -->
													{#if u.banned}
														<form
															method="POST"
															action="?/toggleBan"
															use:enhance={() => {
																closeMenu();
																return async ({ update }) => {
																	update();
																	addToast('User unbanned.');
																};
															}}
														>
															<input
																type="hidden"
																name="userId"
																value={u.id}
															/>
															<button
																type="submit"
																name="action"
																value="unban"
																class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-green-400 hover:bg-slate-700/50"
															>
																<span
																	class="material-symbols-outlined text-base"
																	>check_circle</span
																>
																Unban User
															</button>
														</form>
													{:else}
														<button
															onclick={(e) => {
																e.stopPropagation();
																banTarget = {
																	id: u.id,
																	email: u.email
																};
																banReason = '';
																closeMenu();
															}}
															class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-400 hover:bg-slate-700/50"
														>
															<span
																class="material-symbols-outlined text-base"
																>block</span
															>
															Suspend User
														</button>
													{/if}
													<div class="border-t border-slate-700/30"></div>
													<!-- Delete -->
													<button
														onclick={(e) => {
															e.stopPropagation();
															deleteTarget = {
																id: u.id,
																email: u.email
															};
															closeMenu();
														}}
														class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-slate-700/50"
													>
														<span
															class="material-symbols-outlined text-base"
															>delete</span
														>
														Delete User
													</button>
												{:else}
													<div class="px-4 py-3 text-xs text-slate-500">
														Cannot modify your own account
													</div>
												{/if}
											</div>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
						{#if data.users.length === 0}
							<tr>
								<td
									colspan="5"
									class="px-6 py-12 text-center text-sm text-slate-500"
								>
									{#if hasActiveFilters || data.search}
										<div class="flex flex-col items-center gap-3">
											<span
												class="material-symbols-outlined text-3xl text-slate-600"
												>search_off</span
											>
											<p>No users match your filters.</p>
											<button
												onclick={clearFilters}
												class="text-xs font-semibold text-primary hover:underline"
											>
												Clear all filters
											</button>
										</div>
									{:else}
										No users found.
									{/if}
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if data.totalUsers > 0}
				<div
					class="flex items-center justify-between border-t border-slate-700/40 px-6 py-4"
				>
					<p class="text-sm text-slate-500">
						Showing {startIdx} to {endIdx} of {data.totalUsers.toLocaleString()} results
					</p>
					<div class="flex items-center gap-1">
						{#if data.currentPage > 1}
							<a
								href={buildPageUrl(data.currentPage - 1)}
								class="flex size-8 items-center justify-center rounded-lg text-sm text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
							>
								<span class="material-symbols-outlined text-base"
									>chevron_left</span
								>
							</a>
						{/if}

						{#each Array(Math.min(data.totalPages, 3)) as _, i}
							{@const pageNum =
								data.currentPage <= 2 ? i + 1 : data.currentPage - 1 + i}
							{#if pageNum <= data.totalPages}
								<a
									href={buildPageUrl(pageNum)}
									class="flex size-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors {pageNum ===
									data.currentPage
										? 'bg-primary text-white'
										: 'text-slate-400 hover:bg-slate-700/50'}"
								>
									{pageNum}
								</a>
							{/if}
						{/each}

						{#if data.totalPages > 3 && data.currentPage < data.totalPages - 1}
							<span class="px-1 text-sm text-slate-500">...</span>
							<a
								href={buildPageUrl(data.totalPages)}
								class="flex size-8 items-center justify-center rounded-lg text-sm text-slate-400 transition-colors hover:bg-slate-700/50"
							>
								{data.totalPages}
							</a>
						{/if}

						{#if data.currentPage < data.totalPages}
							<a
								href={buildPageUrl(data.currentPage + 1)}
								class="flex size-8 items-center justify-center rounded-lg text-sm text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
							>
								<span class="material-symbols-outlined text-base"
									>chevron_right</span
								>
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-700/20 px-6 py-6 text-center">
		<p class="text-sm text-slate-600">
			&copy; 2024 NexusID. All rights reserved. Built with advanced identity management
			protocols.
		</p>
	</footer>
</div>

<!-- Add User Modal -->
{#if showAddUser}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
		onclick={closeAddUser}
	>
		<div
			class="mx-4 w-full max-w-md rounded-2xl border border-slate-700/50 bg-[#1e1a3b] p-6 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h3 class="text-lg font-bold text-white">Add New User</h3>
					<p class="text-xs text-slate-400">Create a new account manually.</p>
				</div>
				<button
					onclick={closeAddUser}
					class="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
				>
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			{#if addUserError}
				<div
					class="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-400"
				>
					{addUserError}
				</div>
			{/if}

			<form
				method="POST"
				action="?/addUser"
				use:enhance={() => {
					addUserLoading = true;
					addUserError = '';
					return async ({ result, update }) => {
						addUserLoading = false;
						const d = result.type === 'success' ? (result.data as Record<string, any>) : null;
						if (d?.success) {
							addToast(String(d.message || 'User created successfully.'));
							closeAddUser();
							update();
						} else if (d?.error) {
							addUserError = String(d.error);
						} else {
							addUserError = 'An unexpected error occurred.';
						}
					};
				}}
				class="flex flex-col gap-4"
			>
				<!-- Name -->
				<div class="flex flex-col gap-1.5">
					<label
						class="text-xs font-bold tracking-wider text-slate-500 uppercase"
						for="adduser-name">Full Name</label
					>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-base text-slate-500"
							>person</span
						>
						<input
							id="adduser-name"
							name="name"
							bind:value={addUserName}
							class="h-11 w-full rounded-lg border border-slate-700/50 bg-slate-900/50 pr-4 pl-10 text-sm text-white outline-none placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
							placeholder="John Doe"
							type="text"
							required
						/>
					</div>
				</div>

				<!-- Email -->
				<div class="flex flex-col gap-1.5">
					<label
						class="text-xs font-bold tracking-wider text-slate-500 uppercase"
						for="adduser-email">Email Address</label
					>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-base text-slate-500"
							>mail</span
						>
						<input
							id="adduser-email"
							name="email"
							bind:value={addUserEmail}
							class="h-11 w-full rounded-lg border border-slate-700/50 bg-slate-900/50 pr-4 pl-10 text-sm text-white outline-none placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
							placeholder="user@example.com"
							type="email"
							required
						/>
					</div>
				</div>

				<!-- Password -->
				<div class="flex flex-col gap-1.5">
					<label
						class="text-xs font-bold tracking-wider text-slate-500 uppercase"
						for="adduser-password">Password</label
					>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-base text-slate-500"
							>lock</span
						>
						<input
							id="adduser-password"
							name="password"
							bind:value={addUserPassword}
							class="h-11 w-full rounded-lg border border-slate-700/50 bg-slate-900/50 pr-4 pl-10 text-sm text-white outline-none placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
							placeholder="Minimum 8 characters"
							type="password"
							required
							minlength="8"
						/>
					</div>
				</div>

				<!-- Role (read-only) -->
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Role</label
					>
					<div
						class="flex h-11 items-center rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 text-sm text-slate-400"
					>
						<span class="material-symbols-outlined mr-2 text-base text-slate-500"
							>person</span
						>
						User
					</div>
				</div>

				<div class="mt-2 flex gap-3">
					<button
						type="button"
						onclick={closeAddUser}
						class="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700/50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={addUserLoading}
						class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
					>
						{#if addUserLoading}
							<span class="material-symbols-outlined animate-spin text-base"
								>progress_activity</span
							>
							Creating...
						{:else}
							<span class="material-symbols-outlined text-base">person_add</span>
							Create User
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteTarget}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
		onclick={() => (deleteTarget = null)}
	>
		<div
			class="mx-4 w-full max-w-sm rounded-2xl border border-slate-700/50 bg-[#1e1a3b] p-6 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mb-4 flex flex-col items-center gap-3 text-center">
				<div
					class="flex size-14 items-center justify-center rounded-full bg-red-500/10"
				>
					<span class="material-symbols-outlined text-3xl text-red-400"
						>warning</span
					>
				</div>
				<h3 class="text-lg font-bold text-white">Delete User</h3>
				<p class="text-sm text-slate-400">
					Are you sure you want to permanently delete
					<strong class="text-white">{deleteTarget.email}</strong>? This action cannot
					be undone.
				</p>
			</div>
			<div class="flex gap-3">
				<button
					onclick={() => (deleteTarget = null)}
					class="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700/50"
				>
					Cancel
				</button>
				<form
					method="POST"
					action="?/deleteUser"
					class="flex-1"
					use:enhance={() => {
						return async ({ update }) => {
							addToast('User deleted successfully.');
							deleteTarget = null;
							update();
						};
					}}
				>
					<input type="hidden" name="userId" value={deleteTarget.id} />
					<button
						type="submit"
						class="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700"
					>
						<span class="material-symbols-outlined text-base">delete</span>
						Delete
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Ban/Suspend Modal -->
{#if banTarget}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
		onclick={() => (banTarget = null)}
	>
		<div
			class="mx-4 w-full max-w-sm rounded-2xl border border-slate-700/50 bg-[#1e1a3b] p-6 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mb-4 flex flex-col items-center gap-3 text-center">
				<div
					class="flex size-14 items-center justify-center rounded-full bg-amber-500/10"
				>
					<span class="material-symbols-outlined text-3xl text-amber-400"
						>block</span
					>
				</div>
				<h3 class="text-lg font-bold text-white">Suspend User</h3>
				<p class="text-sm text-slate-400">
					Suspend <strong class="text-white">{banTarget.email}</strong> from accessing
					their account.
				</p>
			</div>

			<form
				method="POST"
				action="?/toggleBan"
				use:enhance={() => {
					return async ({ update }) => {
						addToast('User suspended.');
						banTarget = null;
						update();
					};
				}}
				class="flex flex-col gap-4"
			>
				<input type="hidden" name="userId" value={banTarget.id} />
				<input type="hidden" name="action" value="ban" />

				<div class="flex flex-col gap-1.5">
					<label
						class="text-xs font-bold tracking-wider text-slate-500 uppercase"
						for="ban-reason">Reason (optional)</label
					>
					<textarea
						id="ban-reason"
						name="reason"
						bind:value={banReason}
						rows="3"
						class="w-full resize-none rounded-lg border border-slate-700/50 bg-slate-900/50 p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
						placeholder="e.g. Violation of terms of service..."
					></textarea>
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						onclick={() => (banTarget = null)}
						class="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700/50"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-700"
					>
						<span class="material-symbols-outlined text-base">block</span>
						Suspend
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
