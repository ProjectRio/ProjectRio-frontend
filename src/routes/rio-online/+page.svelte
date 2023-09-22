<script lang="ts">
	import RioLogo from "$lib/images/RioLogo.svg?raw"
	// import { IconCheckbox, IconChevronsRight } from '@tabler/icons-svelte'
	import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";
	export let data
</script>


<div class="container h-full mx-auto flex-col justify-center items-center">
	
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2 mb-4">Welcome to Project Rio.</h2>
<!--		<img class="img-bg" href="$lib/images/RioLogo.png">-->
		<!-- Animated Logo -->
<!--		<figure>-->
<!--			<section class="img-bg" />-->
<!--			&lt;!&ndash; <svg class="fill-token -scale-x-[100%]"> &ndash;&gt;-->
<!--				{@html RioLogo}-->
<!--			&lt;!&ndash; </svg> &ndash;&gt;-->
<!--		</figure>-->
		<!-- / -->
		<div class="flex justify-center space-x-2">
			{#if data}
			<a
				class="btn variant-filled"
				href="https://github.com/ProjectRio/ProjectRio/releases/latest"
				target="_blank"
				rel="noreferrer"
			>
				Download {data.latest}
			</a>
			{:else}
			<a
			class="btn variant-filled"
			href="https://github.com/ProjectRio/ProjectRio/releases/latest"
			target="_blank"
			rel="noreferrer"
		>
			Download Project Rio
		</a>
			{/if}
		</div>
		<hr class="!border-t-2" />

		<div class="space-y-2 flex">
			<div class="card variant-ringed-secondary flex-column m-4 p-4">
				<h4 class="h4 flex-auto">Get Started:</h4>


				<button class="flex-auto m-4"><a href="https://api.projectrio.app/signup/" class="btn variant-ghost-tertiary chip ">Create your Project Rio account</a></button>
				<button class="flex-auto m-4"><a href="/rio-online/tutorial" class="btn variant-ghost-tertiary chip">Setup Tutorial</a></button>

				<!-- <p><code class="code"><a href="https://api.projectrio.app/signup/">Create your Project Rio account</a></code></p>
				<p><code class="code"><a href="https://www.projectrio.online/tutorial">Setup Tutorial</a></code></p> -->
			</div>
			<span class="divider-vertical h-30" />
			<ul class="list flex-col m-4">
				
					<li>
<!--						<span class="badge-icon"><IconCheckbox color="limegreen" class={"icon-tada"} /></span>-->
						<span class="flex-auto">Optimized online play</span>
					</li>
					<li>
<!--						<span class="badge-icon"><IconCheckbox color="limegreen" class={"icon-tada"} /></span>-->
						<span class="flex-auto">Game stat files</span>
					</li>
					<li>
<!--						<span class="badge-icon"><IconCheckbox color="limegreen" class={"icon-tada"} /></span>-->
						<span class="flex-auto">Ranked online</span>
					</li>
					<li>
<!--						<span class="badge-icon"><IconCheckbox color="limegreen" class={"icon-tada"} /></span>-->
						<span class="flex-auto">Public stat database</span>
					</li>
					<li>
<!--						<span class="badge-icon"><IconCheckbox color="limegreen" class={"icon-tada"} /></span>-->
						<span class="flex-auto">Gameplay mods</span>
					</li>
					<!-- ... -->
			</ul>
		</div>
	</div>
	<Accordion class=" w-[50%]">
		<AccordionItem>
			<span slot="summary">Other Resources</span>
			<nav slot="content" class="list-nav">
				<li>
					<a class="flex-auto" href="https://roeming.github.io/MSSB_Batting_Calculator/">
<!--						<span class="badge bg-primary-500"><IconChevronsRight/></span>-->
						<span class="flex-auto">Roeming's Batting Calculator</span>

					</a>
				</li>
				<li>
					<a class="flex-auto" href="https://docs.google.com/spreadsheets/d/16cEcCq-Gkudx5ESfqzS0MJlQI7WTvSIWsHVZS8jv750/edit?usp=sharing">
<!--						<span class="badge bg-primary-500"><IconChevronsRight/></span>-->
						<span class="flex-auto">Datamined Stats & Info</span>

					</a>
				</li>
				<li>
					<a class="flex-auto" href="https://docs.google.com/spreadsheets/d/16cEcCq-Gkudx5ESfqzS0MJlQI7WTvSIWsHVZS8jv750/edit?usp=sharing">
<!--						<span class="badge bg-primary-500"><IconChevronsRight/></span>-->
						<span class="flex-auto">Mario Superstar Baseball Wiki</span>

					</a>
				</li>
				<li>
					<a class="flex-auto" href="https://www.reddit.com/r/MarioBaseball/comments/rohg6j/competitive_mario_superstar_baseball_the_master/?utm_source=share&utm_medium=web2x&context=3">
<!--						<span class="badge bg-primary-500"><IconChevronsRight/></span>-->
						<span class="flex-auto">Competitive Guide/Tutorial</span>

					</a>
				</li>
				<li>
					<a class="flex-auto" href="https://docs.google.com/spreadsheets/d/13zijF8WoYxB3Z4GQRI7wFH6GMEkEqY_CaUQhd-WJQ2M/edit#gid=1510496567">
<!--						<span class="badge bg-primary-500"><IconChevronsRight/></span>-->
						<span class="flex-auto">Neil's Stat Cards</span>

					</a>
				</li>
				<li>
					<a class="flex-auto" href="https://pastebin.com/cPBAFkKf">
<!--						<span class="badge bg-primary-500"><IconChevronsRight/></span>-->
						<span class="flex-auto">Gecko Codes</span>

					</a>
				</li>
				<li>
					<a class="flex-auto" href="https://www.youtube.com/c/DingerCity">
<!--						<span class="badge bg-primary-500"><IconChevronsRight/></span>-->
						<span class="flex-auto">Dinger City Youtube Channel</span>

					</a>
				</li>
				<li>
					<a class="flex-auto" href="https://www.youtube.com/playlist?list=PL8i4ehYol9H0TNb9NrSSP_agA9_OJfe7Y">
<!--						<span class="badge bg-primary-500"><IconChevronsRight/></span>-->
						<span class="flex-auto">Joe Baseball's Basics Series</span>

					</a>
				</li>

			</nav>


		</AccordionItem>


	</Accordion>
</div>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure svg,
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation: pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
		
	}
	/*@keyframes glow {*/
	/*	0% {*/
	/*		@apply bg-primary-400/50;*/
	/*	}*/
	/*	33% {*/
	/*		@apply bg-primary-400/50;*/
	/*	}*/
	/*	66% {*/
	/*		@apply bg-surface-400/50;*/
	/*	}*/
	/*	100% {*/
	/*		@apply bg-primary-400/50;*/
	/*	}*/
	/*}*/
	/*@keyframes pulse {*/
	/*	50% {*/
	/*		transform: scale(1.5);*/
	/*	}*/
	/*}*/

	code:hover {}

	li {
		list-style: none;
	}
</style>
