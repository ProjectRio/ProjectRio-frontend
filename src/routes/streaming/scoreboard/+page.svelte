<script lang='ts'>
    /* Improvements:
        -Allow user to control interval between display changing to a new game
    */
    import LiveScoreboard from "$lib/components/LiveScoreboard.svelte";
import RecentScoreboard from "$lib/components/RecentScoreboard.svelte";
</script>

<div class="set-rows">
    <RecentScoreboard />
    <LiveScoreboard />
</div>

<style>
    .set-rows {
        display: grid;
        grid-template-rows: 15em 15em;
    }
</style>