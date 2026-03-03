<script lang="ts">
	let { children } = $props();
</script>

<div
	class="mesh-gradient flex min-h-screen items-center justify-center bg-background-light p-4 font-display text-slate-900 dark:bg-background-dark dark:text-slate-100"
>
	<div class="flex w-full max-w-[440px] flex-col gap-8">
		<!-- Logo Section -->
		<a href="/" class="group flex flex-col items-center gap-3">
			<div
				class="flex size-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110"
			>
				<span class="material-symbols-outlined text-3xl text-white">fingerprint</span>
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">NexusID</h1>
			<p class="text-sm font-medium text-slate-500 dark:text-slate-400">Secure Digital Identity</p>
		</a>

		{@render children()}

		<!-- Footer Info -->
		<p class="px-8 text-center text-xs text-slate-500 dark:text-slate-400">
			By continuing, you agree to NexusID's
			<a class="font-bold text-slate-900 hover:underline dark:text-slate-300" href="#"
				>Terms of Service</a
			>
			and
			<a class="font-bold text-slate-900 hover:underline dark:text-slate-300" href="#"
				>Privacy Policy</a
			>.
		</p>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	.mesh-gradient {
		background-color: #131022;
		background-image:
			radial-gradient(at 0% 0%, rgba(55, 19, 236, 0.15) 0px, transparent 50%),
			radial-gradient(at 100% 100%, rgba(55, 19, 236, 0.1) 0px, transparent 50%);
	}
</style>
