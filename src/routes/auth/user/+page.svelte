<script lang="ts">
	import { enhance } from '$app/forms';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	let { data }: { data: any } = $props();
	const initials = $derived(data.firstName?.[0] + data.lastName?.[0]);

	const basicButton = 'preset-filled-primary-100-900';

	let links = [
		{
			title: 'Dashboard',
			href: '/dashboard',
			classes: basicButton
		}
	];
</script>

<div class="container">
	<div class="card-wrapper">
		<div class="avatar" data-initials="">
			<span class="avatar-text">{initials}</span>
		</div>

		<div class="profile-card">
			<div class="profile-name">{data.firstName + ' ' + data.lastName}</div>
			<div class="profile-email">{data.email}</div>
			<div class="profile-role">{data.role}</div>
		</div>
	</div>

	<div class="links-section">
		{#each links as item}
			<a class="link-button" href={item.href}>
				{item.title}
				<span class="arrow-icon">→</span>
			</a>
		{/each}
		<form action="/auth/user/logout" method="POST" use:enhance>
			<button type="submit" class="link-button">
				Logout
				<span class="arrow-icon">→</span>
			</button>
		</form>
	</div>
</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	body {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		min-height: 100vh;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		align-items: center;
		justify-content: flex-start;
		padding: 1rem;
		gap: 2rem;
	}

	@media (min-width: 640px) {
		.container {
			flex-direction: row;
			justify-content: center;
			gap: 3rem;
		}
	}

	.card-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 100%;
		border-radius: 1.5rem;
		padding: 1rem;
		gap: 2rem;
	}

	@media (min-width: 640px) {
		.card-wrapper {
			max-width: 28rem;
			padding: 2rem;
		}
	}

	/* Avatar Component */
	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 10rem;
		height: 10rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
		margin-top: 2.5rem;
		margin-bottom: 2.5rem;
		flex-shrink: 0;
	}

	.avatar-text {
		font-size: 2.5rem;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 0.05em;
	}

	/* Profile Card */
	.profile-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background-color: var(--color-background);
		border-radius: 1.5rem;
		padding: 1.5rem;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		width: 100%;
	}

	.profile-name {
		text-align: center;
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
	}

	.profile-email {
		text-align: center;
		font-size: 1.125rem;
		color: #4b5563;
		font-weight: 500;
	}

	.profile-role {
		text-align: center;
		font-size: 1.125rem;
		color: #6b7280;
		font-weight: 500;
		text-transform: capitalize;
	}

	/* Links Section */
	.links-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		width: 100%;
	}

	@media (min-width: 640px) {
		.links-section {
			width: auto;
			padding: 0;
		}
	}

	.link-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: #ffffff;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border: none;
		border-radius: 2rem;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
		min-width: 200px;
	}

	.link-button:hover {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
		box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
		transform: translateY(-2px);
	}

	.link-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
	}

	.arrow-icon {
		font-size: 1.25rem;
		font-weight: 700;
		transition: transform 0.3s ease;
	}

	.link-button:hover .arrow-icon {
		transform: translateX(4px);
	}
</style>
