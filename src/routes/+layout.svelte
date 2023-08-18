<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '../theme.postcss';
	//import '../theme.postcss';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/all.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import {
		AppBar,
		AppShell,
		Avatar,
		Drawer,
		Modal,
		Toast,
		dataTableHandler,
		drawerStore
	} from '@skeletonlabs/skeleton';
	import { browser } from '$app/environment';

	import {MenuIcon} from "lucide-svelte";
	import Nav from '$lib/components/Nav.svelte';
	import { APP_NAME } from '$lib/config/constants';
	// import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	// export let data;

	import { username } from '$lib/stores/user';

	function drawerOpen(): void {
		drawerStore.open();
	}

	$: if (browser) {
		if (!$username) {
			if (localStorage.getItem('username')) {
				$username = localStorage.getItem('username');
				console.log($username);
			}
		}
	}
</script>

<Toast position="tr" />
<Modal />
<Drawer>
	<Nav user={$username} />
</Drawer>

<AppShell slotSidebarLeft="w-0 md:w-52 bg-surface-500/10">
	<svelte:fragment slot="header">
		<AppBar>
			<svelte:fragment slot="lead">
				<button class="md:hidden btn btn-sm mr-4" aria-label="Menu Button" on:click={drawerOpen}>
					<span>
						<MenuIcon />
					</span>
				</button>
				<strong class="text-xl uppercase">{APP_NAME}</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#if $username}
					{$username}
<!--					<Avatar {$username} width="w-10" background="bg-primary-500" />-->
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<Nav user={$username} />
	</svelte:fragment>
	<!-- Main Content -->
	<div class="container lg:p-10 mx-auto">
		<slot />
	</div>
	<svelte:fragment slot="pageFooter"></svelte:fragment>
</AppShell>

