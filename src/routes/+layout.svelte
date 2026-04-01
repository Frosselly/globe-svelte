<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<a href="/">Home</a>
	<a href="/map">Map</a>
	<a href="/tables">Tables</a>
	<a href="/sources">Sources</a>
	<a href="/testing">Test</a>
	<a href="/chat">Chat</a>
	<a href="/topics">Topics nav</a>
</nav>

<article>
	{@render children()}
</article>

<style>
	:global {
		body,
		html {
			height: 100%;
		}
		* {
			margin: 0;
		}
		h3 {
			text-decoration: underline;
		}
	}
	nav {
		padding: 1rem;
		display: flex;
		gap: 1rem;
		width: 100%;
		border-bottom: black solid 1px;
		font-size: 1.3rem;

		a:visited {
			color: black;
		}
		a:hover {
			color: blue;
		}
	}

	article {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}
</style>
