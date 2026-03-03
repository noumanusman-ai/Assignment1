<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>NexusID - Secure Digital Identity</title>
</svelte:head>

<div
	class="gradient-mesh relative flex min-h-screen flex-col overflow-x-hidden bg-background-light text-slate-900 antialiased dark:bg-background-dark dark:text-slate-100"
>
	<!-- Navigation -->
	<header
		class="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-background-light/80 px-6 py-4 backdrop-blur-md lg:px-20 dark:border-slate-800/50 dark:bg-background-dark/80"
	>
		<div class="group flex cursor-pointer items-center gap-2">
			<div
				class="flex size-10 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20"
			>
				<span class="material-symbols-outlined text-2xl text-white">fingerprint</span>
			</div>
			<h2 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">NexusID</h2>
		</div>
		<nav class="hidden items-center gap-10 md:flex">
			<a
				class="text-sm font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
				href="#">Features</a
			>
			<a
				class="text-sm font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
				href="#">Documentation</a
			>
			<a
				class="text-sm font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
				href="#">Enterprise</a
			>
			<a
				class="text-sm font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
				href="#">Pricing</a
			>
		</nav>
		<div class="flex items-center gap-4">
			{#if !data.user}
				<a
					href="/login"
					class="hidden items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 sm:flex"
				>
					Get Started
				</a>
			{:else}
				<a
					href="/profile"
					class="hidden items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 sm:flex"
				>
					Dashboard
				</a>
				<div
					class="size-10 rounded-full border-2 border-slate-200 bg-cover bg-center dark:border-slate-800"
					style:background-image="url({data.user.image || `https://avatar.vercel.sh/${data.user.email}`})"
				></div>
			{/if}
		</div>
	</header>

	<main class="flex-1">
		<!-- Hero Section -->
		<section
			class="mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-24 text-center lg:pt-32 lg:pb-40"
		>
			<div
				class="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase"
			>
				<span class="material-symbols-outlined text-sm">auto_awesome</span>
				v2.0 is now live
			</div>
			<h1
				class="max-w-4xl text-5xl leading-[1.1] font-extrabold tracking-tight text-slate-900 lg:text-7xl dark:text-white"
			>
				Secure Your <span class="bg-clip-text text-primary">Digital Identity</span>
			</h1>
			<p
				class="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 lg:text-xl dark:text-slate-400"
			>
				Powered by <span class="font-semibold text-slate-900 dark:text-slate-100">Svelte 5</span>
				and <span class="font-semibold text-slate-900 dark:text-slate-100">PostgreSQL</span> for unmatched
				performance and military-grade security.
			</p>
			<div class="mt-12 flex w-full flex-col justify-center gap-4 sm:flex-row">
				<a
					href={data.user ? '/profile' : '/login'}
					class="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all hover:shadow-primary/40"
				>
					{data.user ? 'Go to Dashboard' : 'Get Started'}
					<span class="material-symbols-outlined text-lg">arrow_forward</span>
				</a>
				<a
					href="https://github.com"
					class="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-8 py-4 text-base font-bold text-slate-900 transition-all hover:bg-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
				>
					<span class="material-symbols-outlined text-lg">code</span> View on GitHub
				</a>
			</div>
			<!-- Abstract Visual -->
			<div
				class="mt-20 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/50 p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900/50"
			>
				<div
					class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-200 dark:bg-background-dark"
				>
					<div
						class="absolute inset-0 bg-[url('https://placeholder.pics/svg/800')] bg-cover bg-center opacity-20"
					></div>
					<div class="relative flex flex-col items-center gap-4">
						<span class="material-symbols-outlined text-8xl text-primary/40">verified_user</span>
						<div class="h-2 w-48 overflow-hidden rounded-full bg-primary/20">
							<div class="h-full w-2/3 bg-primary"></div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Tech Stack Section -->
		<section class="bg-slate-100/50 py-24 dark:bg-slate-900/30">
			<div class="mx-auto max-w-7xl px-6">
				<div class="mb-16 text-center">
					<h2 class="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl dark:text-white">
						Modern Tech Stack
					</h2>
					<p class="mt-4 text-slate-600 dark:text-slate-400">
						Built with the latest technologies for speed, security, and developer experience.
					</p>
				</div>
				<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
					<!-- SvelteKit Card -->
					<div
						class="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-primary/50 dark:border-slate-800 dark:bg-slate-950"
					>
						<div
							class="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110"
						>
							<span class="material-symbols-outlined text-3xl text-primary">bolt</span>
						</div>
						<h3 class="mb-3 text-xl font-bold text-slate-900 dark:text-white">SvelteKit</h3>
						<p class="leading-relaxed text-slate-600 dark:text-slate-400">
							Fast, modern web framework for building high-performance applications with full-stack
							capabilities.
						</p>
					</div>
					<!-- Drizzle Card -->
					<div
						class="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-primary/50 dark:border-slate-800 dark:bg-slate-950"
					>
						<div
							class="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110"
						>
							<span class="material-symbols-outlined text-3xl text-primary">database</span>
						</div>
						<h3 class="mb-3 text-xl font-bold text-slate-900 dark:text-white">Drizzle ORM</h3>
						<p class="leading-relaxed text-slate-600 dark:text-slate-400">
							Type-safe database interactions with seamless schema management and zero-overhead
							performance.
						</p>
					</div>
					<!-- Auth.js Card -->
					<div
						class="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-primary/50 dark:border-slate-800 dark:bg-slate-950"
					>
						<div
							class="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110"
						>
							<span class="material-symbols-outlined text-3xl text-primary"
								>admin_panel_settings</span
							>
						</div>
						<h3 class="mb-3 text-xl font-bold text-slate-900 dark:text-white">Auth.js</h3>
						<p class="leading-relaxed text-slate-600 dark:text-slate-400">
							Secure authentication for the modern web with flexible providers and seamless session
							management.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Call to Action -->
		<section class="mx-auto max-w-7xl px-6 py-24 text-center">
			<div
				class="relative overflow-hidden rounded-3xl bg-primary p-12 shadow-2xl shadow-primary/20 lg:p-20"
			>
				<div
					class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-10"
				></div>
				<div class="relative z-10 flex flex-col items-center">
					<h2 class="mb-6 text-3xl font-extrabold tracking-tight text-white lg:text-5xl">
						Ready to secure your identity?
					</h2>
					<p class="mb-10 max-w-xl text-lg text-white/80">
						Join thousands of developers building the future of secure, distributed authentication.
					</p>
					<a
						href={data.user ? '/profile' : '/login'}
						class="rounded-xl bg-white px-10 py-4 text-lg font-bold text-primary transition-all hover:bg-slate-100 active:scale-95"
					>
						{data.user ? 'Go to Dashboard' : 'Start Building Now'}
					</a>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer
		class="border-t border-slate-200 bg-background-light px-6 py-16 lg:px-20 dark:border-slate-800 dark:bg-background-dark"
	>
		<div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row">
			<div class="flex flex-col items-center gap-4 md:items-start">
				<div class="flex items-center gap-2">
					<div class="flex size-8 items-center justify-center rounded-md bg-primary">
						<span class="material-symbols-outlined text-lg text-white">fingerprint</span>
					</div>
					<h2 class="text-lg font-bold text-slate-900 dark:text-white">NexusID</h2>
				</div>
				<p class="text-sm text-slate-500">Empowering developers with secure identity solutions.</p>
			</div>
			<div class="flex flex-wrap justify-center gap-8 lg:gap-12">
				<a
					class="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
					href="#">Privacy Policy</a
				>
				<a
					class="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
					href="#">Terms of Service</a
				>
				<a
					class="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
					href="#">Documentation</a
				>
			</div>
			<div class="flex gap-4">
				<a
					class="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-all hover:bg-primary/10 hover:text-primary dark:bg-slate-900 dark:text-slate-400"
					href="#"
				>
					<span class="material-symbols-outlined text-xl">hub</span>
				</a>
				<a
					class="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-all hover:bg-primary/10 hover:text-primary dark:bg-slate-900 dark:text-slate-400"
					href="#"
				>
					<span class="material-symbols-outlined text-xl">terminal</span>
				</a>
				<a
					class="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-all hover:bg-primary/10 hover:text-primary dark:bg-slate-900 dark:text-slate-400"
					href="#"
				>
					<span class="material-symbols-outlined text-xl">chat</span>
				</a>
			</div>
		</div>
		<div
			class="mx-auto mt-12 max-w-7xl border-t border-slate-200 pt-8 text-center text-xs text-slate-500 dark:border-slate-800"
		>
			© 2024 NexusID. Built with Svelte 5 and Indigo accents. All rights reserved.
		</div>
	</footer>
</div>
