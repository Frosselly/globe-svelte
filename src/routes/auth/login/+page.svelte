<script lang="ts">
	let { data, form } = $props();
</script>

<div>
	<nav>
		<a href="/auth/login">log</a>
		<a href="/auth/signup">reg</a>
		<a href="/auth/user">user</a>
	</nav>
</div>
<div class="flex h-screen items-center justify-center">
	<div class="card preset-tonal m-2 w-full max-w-full space-y-6 rounded-2xl p-8 sm:max-w-md">
		<div class="mb-10 text-center text-3xl font-bold">Prisijungimas</div>

		<form method="POST" action="?/login" class="space-y-6" name="initLogin">
			<span>Email</span>
			<label class="label mt-2">
				<input
					id="phone"
					class="input preset-tonal"
					type="tel"
					required
					name="phone"
					autocomplete="off"
				/>
			</label>

			<span>Password</span>
			<label class="label mt-2">
				<input
					id="phone"
					class="input preset-tonal"
					type="tel"
					required
					name="phone"
					autocomplete="off"
				/>
			</label>

			<button
				type="submit"
				class="btn preset-filled-primary-500 w-full rounded-3xl p-2 text-lg font-semibold"
			>
				Prisijungti
			</button>
		</form>
		<p class="text-center">
			Neturite paskyros?
			<a class="btn font-semibold" href="/signup"> Užsiregistruokite </a>
		</p>
		{#if form?.error}<p class="text-center text-error-500">{form.error}</p>{/if}
	</div>
</div>
