<script lang="ts">
	import AGTableAdmin from '$lib/components/table/AGTableAdmin.svelte';

	let { data } = $props();

	let users = $state(data.users);

	// Filter & Search State
	let searchQuery = $state('');
	let roleFilter = $state('all'); // 'all' | 'admin' | 'user'
	let selectedUsers = $state<any[]>([]);

	// Derived array to automatically filter users based on the Role Dropdown
	let filteredUsers = $derived(
		users.filter((u: any) => {
			if (roleFilter === 'admin') return u.isAdmin;
			if (roleFilter === 'user') return !u.isAdmin;
			return true;
		})
	);

	// Modals State
	let showDeleteModal = $state(false);
	let showFormModal = $state(false);
	let selectedUser = $state<any>(null);
	let formData = $state<any>({ id: '', isAdmin: false });

	function handleEdit(user: any) {
		formData = { id: user.id, isAdmin: user.isAdmin };
		showFormModal = true;
	}

	function handleDeleteRequest(user: any) {
		selectedUser = user;
		showDeleteModal = true;
	}

	async function confirmDelete() {
		const res = await fetch(`/api/users/${selectedUser.id}`, { method: 'DELETE' });

		if (res.ok) {
			users = users.filter((u: any) => u.id !== selectedUser.id);
			selectedUsers = selectedUsers.filter((u) => u.id !== selectedUser.id);
		} else {
			alert('Failed to delete user');
		}

		showDeleteModal = false;
		selectedUser = null;
	}

	async function saveUser() {
		const res = await fetch(`/api/users/${formData.id}/admin`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isAdmin: formData.isAdmin })
		});

		if (res.ok) {
			users = users.map((u: any) =>
				u.id === formData.id ? { ...u, isAdmin: formData.isAdmin } : u
			);
		} else {
			alert('Failed to update user');
		}
		showFormModal = false;
	}

	// AG Grid Columns
	const columnDefs = [
		{
			headerName: 'Display Name',
			field: 'displayName',
			minWidth: 250
		},
		{ headerName: 'Email', field: 'email' },
		{
			headerName: 'Role',
			field: 'isAdmin',
			valueFormatter: (p: any) => (p.value ? 'Admin' : 'User'),
			maxWidth: 150
		},
		{
			headerName: 'Actions',
			field: 'id',
			sortable: false,
			filter: false,
			minWidth: 200,
			cellRenderer: (params: any) => {
				const container = document.createElement('div');
				container.className = 'ag-cell-wrapper';

				const editBtn = document.createElement('button');
				editBtn.innerText = 'Edit Role';
				editBtn.className = 'grid-action-btn';
				editBtn.onclick = () => params.context.onEdit(params.data);

				const deleteBtn = document.createElement('button');
				deleteBtn.innerText = 'Delete';
				deleteBtn.className = 'grid-action-btn danger';
				deleteBtn.onclick = () => params.context.onDelete(params.data);

				container.appendChild(editBtn);
				container.appendChild(deleteBtn);
				return container;
			}
		}
	];
</script>

<section class="container">
	<div class="header">
		<h2>User Management</h2>
	</div>

	<!-- Toolbar for Search, Filters, and Actions -->
	<div class="toolbar">
		<div class="toolbar-left">
			<!-- Search Bar -->
			<input
				type="text"
				class="search-input"
				placeholder="Search users..."
				bind:value={searchQuery}
			/>

			<!-- Filter Dropdown -->
			<select class="filter-select" bind:value={roleFilter}>
				<option value="all">All Roles</option>
				<option value="admin">Admins Only</option>
				<option value="user">Users Only</option>
			</select>
		</div>

		<div class="toolbar-right">
			<!-- Bulk Action Checkbox Logic Example -->
			{#if selectedUsers.length > 0}
				<button class="btn-danger">
					Delete Selected ({selectedUsers.length})
				</button>
			{/if}
		</div>
	</div>

	<!-- Render the Table -->
	<AGTableAdmin
		{columnDefs}
		rowData={filteredUsers}
		quickFilterText={searchQuery}
		onSelectionChanged={(rows) => (selectedUsers = rows)}
		context={{ onEdit: handleEdit, onDelete: handleDeleteRequest }}
	/>
</section>

<!-- Modals (Unchanged from previous iteration) -->
{#if showFormModal}
	<div class="modal-overlay">
		<div class="modal card">
			<h3>Edit User Role</h3>
			<p>Change permissions for this user.</p>

			<div class="form-group row">
				<input id="admin" type="checkbox" bind:checked={formData.isAdmin} />
				<label for="admin">User is Administrator</label>
			</div>

			<div class="modal-actions">
				<button class="btn-default" onclick={() => (showFormModal = false)}>Cancel</button>
				<button class="btn-primary" onclick={saveUser}>Save Changes</button>
			</div>
		</div>
	</div>
{/if}

{#if showDeleteModal}
	<div class="modal-overlay">
		<div class="modal card text-center">
			<h3>Confirm Delete</h3>
			<p>
				Are you sure you want to delete user <strong>{selectedUser?.email}</strong>? This action
				cannot be undone.
			</p>
			<div class="modal-actions center-actions">
				<button class="btn-default" onclick={() => (showDeleteModal = false)}>Cancel</button>
				<button class="btn-primary btn-danger" onclick={confirmDelete}>Confirm Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		margin: 40px auto;
		width: 95%;
		max-width: 1200px;
		font-family: sans-serif;
	}
	.header h2 {
		margin-bottom: 20px;
		color: #111827;
	}

	/* Toolbar Styles */
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		flex-wrap: wrap;
		gap: 16px;
	}
	.toolbar-left {
		display: flex;
		gap: 12px;
	}
	.search-input {
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		width: 250px;
		font-size: 14px;
	}
	.filter-select {
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background-color: white;
		font-size: 14px;
		cursor: pointer;
	}

	/* Buttons */
	.btn-default {
		background: #f3f4f6;
		color: #374151;
		padding: 8px 16px;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		cursor: pointer;
	}
	.btn-primary {
		background: #2563eb;
		color: white;
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}
	.btn-danger {
		background: #dc2626;
		color: white;
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	/* Modals */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.modal {
		width: 400px;
		background: #ffffff;
		color: #111827;
		padding: 24px;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	}
	.form-group.row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 20px 0;
	}
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 24px;
	}
	.center-actions {
		justify-content: center;
	}
	.text-center {
		text-align: center;
	}
</style>
