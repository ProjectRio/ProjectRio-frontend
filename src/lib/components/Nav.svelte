<script lang="ts">
	import { LightSwitch, dataTableHandler } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { drawerStore } from '@skeletonlabs/skeleton';
    import { username } from '$lib/stores/user';
	import { onDestroy } from 'svelte';
	function drawerClose(): void {
		drawerStore.close();
	}
	export let user: any;
	$: user = $username;
    // const unsubscribe = username.subscribe((name) => {
    //     user = name;
    // })

    // onDestroy(unsubscribe)

    // console.log(user)
</script>

<nav class="list-nav p-4">
	<div class="flex flex-row justify-between items-center">
		<div class="">
			<LightSwitch />
		</div>
	</div>

	<ul class="list mt-8">
		<li>
			<a href="/" on:click={drawerClose}>
				<span></span><span class="flex-auto">{'home'}</span></a
			>
		</li>
<!--		<li>-->
<!--			<a href="/stats" on:click={drawerClose}>-->
<!--				<span></span><span class="flex-auto">{'stats'}</span></a>-->
<!--		</li>-->
			<li>
				<a href="/modes/all" on:click={drawerClose}>
					<span></span><span class="flex-auto">{'modes'}</span></a
				>
			</li>
<!--		<li>-->
<!--			<a href="/tag_set/create" on:click={drawerClose}>-->
<!--				<span></span><span class="flex-auto">{'Create Game Mode'}</span></a-->
<!--			>-->
<!--		</li>-->

		{#if user}

<!--			<li>-->
<!--				<form-->
<!--					use:enhance-->
<!--					action="/logout"-->
<!--					method="post"-->
<!--					on:click={drawerClose}-->
<!--					on:keydown={drawerClose}-->
<!--				>-->
<!--					<button type="submit" class="btn"-->
<!--						><span></span><span>{'logout'}</span></button-->
<!--					>-->
<!--				</form>-->
<!--			</li>-->
			<li>
			<a href="/logout" on:click={drawerClose}>
				<span></span><span class="flex-auto">{'logout'}</span></a
			>
			</li>
		{/if}
		{#if !user}
			<li>
				<a href="/login" on:click={drawerClose}>
					<span></span><span class="flex-auto">{'login'}</span></a
				>
			</li>
			<li>
<!--				<a href="/signup" on:click={drawerClose}>-->
<!--					<span></span><span class="flex-auto">{'signup'}</span></a>-->
			</li>
		{/if}
	</ul>
</nav>
