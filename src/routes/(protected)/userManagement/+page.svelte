<script lang="ts">
	const users = [
		{
			name: 'Jhon',
			role: 'admin',
			email: 'jebedahyah@gmail.com'
		},
		{
			name: 'Alice',
			role: 'user',
			email: 'aliceInAWonderland@gmail.com'
		}
	];
	const deleteSelection = false;
</script>

<section class="center">
	<div class="container card">
		{#each users as user}
			<div class="card">
				<div class="flex between">
					<div class="flex-col">
						<div>{user.name}</div>
						<div class="text-gray">{user.email}</div>
					</div>
					<div>{user.role}</div>
					<div>
						<button>Edit</button>
						<button>Delete</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

{#if deleteSelection}
	<div class="popup-container center">
		<div class="popup card flex-col between">
			<div class="num-mid">Are you sure you want to delete the user?</div>
			<br />
			<div>
				<button>Delete</button>
				<button>Cancel</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.popup {
		width: 260px;
		text-align: center;
	}
	.popup-container {
		position: absolute;
		background-color: gray;
		opacity: 0.5;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		margin: 0;
		inset: -5px;
	}
	.container {
		margin: 60px 0;
		width: 100%;
		max-width: 600px;
	}
</style>
