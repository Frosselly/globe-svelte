<script lang="ts">
	import { onMount } from 'svelte';
	import {
		createGrid,
		ModuleRegistry,
		ClientSideRowModelModule,
		type GridOptions,
		themeQuartz,
		colorSchemeDarkBlue
	} from 'ag-grid-community';

	//EXAMPLE
	// const columns = [
	// 	{ headerName: 'Course', field: 'course' },
	// 	{ headerName: 'Instructor', field: 'instructor' },
	// 	{ headerName: 'Duration', field: 'duration' },
	// 	{ headerName: 'Location', field: 'location' },
	// 	{ headerName: 'Rating', field: 'rating' }
	// ];

	// const rows = [
	// 	{
	// 		course: 'JavaScript Basics',
	// 		instructor: 'John Doe',
	// 		duration: '5 hours',
	// 		location: 'Delhi',
	// 		rating: '3'
	// 	},
	// 	{
	// 		course: 'Svelte Fundamentals',
	// 		instructor: 'Jane Smith',
	// 		duration: '3 hours',
	// 		location: 'Delhi',
	// 		rating: '2'
	// 	},
	// 	{
	// 		course: 'Advanced React',
	// 		instructor: 'Jake White',
	// 		duration: '6 hours',
	// 		location: 'Delhi',
	// 		rating: '5'
	// 	}
	// ];
	ModuleRegistry.registerModules([ClientSideRowModelModule]);
	let { columnDefs, rowData } = $props();
	// export let columnDefs: Array<any> = [];
	// export let rowData: Array<any> = [];

	// Create a custom dark theme using Theming API
	const darkTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
		backgroundColor: '#212121',
		foregroundColor: '#ffffff',
		headerBackgroundColor: '#37474f',
		headerTextColor: '#cfd8dc',
		oddRowBackgroundColor: '#263238'
	});

	let gridDiv: HTMLDivElement;

	onMount(() => {
		const gridOptions: GridOptions<any> = {
			theme: darkTheme,
			columnDefs,
			rowData,
			defaultColDef: {
				sortable: true,
				filter: true
			}
		};

		if (gridDiv) {
			createGrid(gridDiv, gridOptions);
		}
	});
</script>

<!-- Grid Container -->
<div bind:this={gridDiv} style="height: 400px; width: 100%;"></div>
