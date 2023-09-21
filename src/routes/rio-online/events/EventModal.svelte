<script lang="ts">
	import { modalStore } from '@skeletonlabs/skeleton';
import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';

	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	// Base Classes
	const cBase = 'relative w-modal-wide shadow-xl';
	const cButton = 'absolute -top-3 -right-3 z-1 btn-icon variant-filled';
	const cIframe = 'bg-black w-full aspect-video rounded-container-token overflow-hidden';
    
	function modalDemo(): void {
		const modal: ModalSettings = {
			type: 'alert',
			title: 'Hello Skeleton',
			body: 'This modal example includes a title, body, and image.',
			image: 'https://i.imgur.com/TykCy5e.gif'
			// image: 'https://i.imgur.com/WOgTG96.gif'
		};
		modalStore.trigger(modal);
	}

    
</script>

<!-- @component This example creates an embedded video modal. -->

{#if $modalStore.length > 0}
	<div class="event-modal {cBase}">
		<button class={cButton} on:click={modalDemo} >Event</button>
	</div>
{/if}