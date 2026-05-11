<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		createGrid,
		ModuleRegistry,
		ClientSideRowModelModule,
		type GridOptions,
		themeQuartz,
		type GridApi
	} from 'ag-grid-community';

	ModuleRegistry.registerModules([ClientSideRowModelModule]);

	let {
		columnDefs,
		rowData,
		context = {},
		pagination = true,
		quickFilterText = '', // Accepts search queries
		onSelectionChanged = undefined // Callback for checkbox selection
	} = $props();

	let gridDiv: HTMLDivElement;
	let gridApi: GridApi | undefined;

	onMount(() => {
		const gridOptions: GridOptions<any> = {
			theme: themeQuartz, // Default white/light theme
			columnDefs,
			rowData,
			context,
			pagination,
			paginationPageSize: 10,
			paginationPageSizeSelector: [10, 20, 50],
			rowSelection: {
				mode: 'multiRow'
			},
			onSelectionChanged: (event) => {
				if (onSelectionChanged) {
					onSelectionChanged(event.api.getSelectedRows());
				}
			},
			defaultColDef: {
				sortable: true,
				filter: true, // Enables column-specific filter menus
				flex: 1,
				minWidth: 100
			}
		};

		if (gridDiv) {
			gridApi = createGrid(gridDiv, gridOptions);
		}
	});

	// Reactively update row data
	$effect(() => {
		if (gridApi && rowData) {
			gridApi.setGridOption('rowData', rowData);
		}
	});

	// Reactively update search bar filter
	$effect(() => {
		if (gridApi && quickFilterText !== undefined) {
			gridApi.setGridOption('quickFilterText', quickFilterText);
		}
	});

	onDestroy(() => {
		if (gridApi) gridApi.destroy();
	});
</script>

<div bind:this={gridDiv} class="grid-wrapper" style="height: 500px; width: 100%;"></div>

<style>
	/* Scoped CSS for dynamic HTML injected by AG Grid */
	.grid-wrapper :global(.grid-action-btn) {
		padding: 6px 12px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		background-color: #ffffff;
		color: #374151;
		transition: all 0.2s;
	}
	.grid-wrapper :global(.grid-action-btn:hover) {
		background-color: #f3f4f6;
	}

	.grid-wrapper :global(.grid-action-btn.danger) {
		background-color: #fee2e2;
		color: #b91c1c;
		border-color: #fca5a5;
	}
	.grid-wrapper :global(.grid-action-btn.danger:hover) {
		background-color: #fecaca;
	}

	.grid-wrapper :global(.ag-cell-wrapper) {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 100%;
	}
</style>
