<script lang="ts">
	// import { Avatar } from '@skeletonlabs/skeleton-svelte';
	// import { ArrowRight } from '@lucide/svelte';

	let { data }: { data: any } = $props();

	const basicButton = 'preset-filled-primary-100-900';

	let links = [
		{
			title: 'Prietaisai',
			href: '/user/devices',
			classes: basicButton
		},
		{
			title: 'Atsijungti',
			href: '/user/logout',
			classes: 'preset-filled-error-100-900'
		}
	];
</script>

<div class="flex flex-col h-screen items-center justify-start sm:justify-center sm:flex-row">
	<div class="flex flex-col items-center w-full max-w-full rounded-2xl p-4 sm:p-8 sm:max-w-md">
		<!-- <Avatar
			classes="size-40 mt-10 mb-10"
			style="font-size: 40px"
			name={data.first_name + ' ' + data.last_name}
		></Avatar> -->

		<div class="flex flex-col card preset-tonal rounded-2xl p-6">
			<div class="pb-4 text-center text-3xl font-bold">
				{data.first_name + ' ' + data.last_name}
			</div>
			<div class="text-center text-xl">{data.email}</div>
			<div class="text-center text-xl">{data.role}</div>
		</div>
	</div>
	<div class="space-y-4 p-6">
		{#each links as item}
			<a
				class={'btn w-full rounded-3xl p-2 text-lg font-semibold ' + item.classes}
				href={item.href}
			>
				{item.title}
				<!-- <ArrowRight class="allign-right"></ArrowRight> -->
			</a>
		{/each}
	</div>
</div>
