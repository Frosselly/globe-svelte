<script lang="ts">
	let { form } = $props();
</script>

<div class="card flex-col">
	<h2 class="">Registracija</h2>

	<form action="?/signup" method="POST">
		<span>First Name</span>
		<label class="label mt-2">
			<input id="firstName" type="text" required name="firstName" autocomplete="off" />
		</label>
		<span>Last Name</span>
		<label class="label mt-2">
			<input id="lastName" type="text" required name="lastName" autocomplete="off" />
		</label>
		<span>Username</span>
		<label class="label mt-2">
			<input id="username" type="text" required name="username" autocomplete="off" />
		</label>

		<span>Email</span>
		<label class="label mt-2">
			<input id="email" type="email" required name="email" autocomplete="off" />
		</label>

		<span>Password</span>
		<label class="label mt-2">
			<input id="password" type="password" required name="password" autocomplete="off" />
		</label>

		<button
			type="submit"
			class="btn preset-filled-primary-500 mt-2 w-full rounded-3xl p-2 text-lg font-semibold"
		>
			Užsiregistruoti
		</button>
		{#if form?.error}<p class="text-center text-error-500">{form.error}</p>{/if}
	</form>
</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	/* body {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background-color: #f3f4f6;
		color: #1f2937;
	} */

	.card {
		width: 100%;
		max-width: 420px;
		margin: 2rem auto;
		padding: 2.5rem;
		background-color: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
	}

	h2 {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 2rem;
		text-align: center;
		letter-spacing: -0.02em;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	form > span {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: -1rem;
		letter-spacing: 0.01em;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		color: #111827;
		background-color: #ffffff;
		border: 1.5px solid #d1d5db;
		border-radius: 8px;
		outline: none;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background-color 0.2s ease;
	}

	input:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
		background-color: #ffffff;
	}

	input::placeholder {
		color: #9ca3af;
	}

	input:required {
		border-color: #e5e7eb;
	}

	.btn {
		padding: 0.85rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: #ffffff;
		background-color: #3b82f6;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		transition:
			background-color 0.2s ease,
			transform 0.1s ease,
			box-shadow 0.2s ease;
	}

	.btn:hover {
		background-color: #2563eb;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.btn:active {
		transform: scale(0.98);
		background-color: #1d4ed8;
	}

	.text-center {
		text-align: center;
		font-size: 0.9rem;
		color: #ffffff;
	}

	.text-error-500 {
		color: #ef4444;
		font-weight: 500;
		padding: 0.75rem 1rem;
		background-color: #fee2e2;
		border-radius: 8px;
		margin-top: 0.5rem;
	}
</style>
