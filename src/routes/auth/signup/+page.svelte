<script lang="ts">
	let { form } = $props();
</script>

<div class="flex h-screen items-center justify-center">
	<div class="card preset-tonal m-2 w-full max-w-full space-y-6 rounded-2xl p-8 sm:max-w-md">
		<div class="mb-10 text-center text-3xl font-bold">Registracija</div>

		<form action="?/signup" method="POST" class="space-y-6">
			<span>Username</span>
			<label class="label mt-2">
				<input
					id="first_name"
					class="input preset-tonal"
					type="text"
					required
					name="first_name"
					autocomplete="off"
				/>
			</label>

			<span>Email</span>
			<label class="label mt-2">
				<input
					id="email"
					class="input preset-tonal"
					type="email"
					required
					name="email"
					autocomplete="off"
				/>
			</label>

			<span>Password</span>
			<label class="label mt-2">
				<input
					id="email"
					class="input preset-tonal"
					type="email"
					required
					name="email"
					autocomplete="off"
				/>
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
</div>
