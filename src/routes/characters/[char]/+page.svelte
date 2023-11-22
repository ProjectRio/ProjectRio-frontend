<script lang="ts">
    import { page } from '$app/stores';
</script>

<h1>UNDER CONSTRUCTION</h1>

<p>{$page.params.char}'s character page. This will contain core ingame stats, some basic stats of user performance with the character, and links to detailed stat tables for the character.</p>

<a href={`${$page.params.char}/batting`}>batting stats</a>
<a href={`${$page.params.char}/pitching`}>pitching stats</a>