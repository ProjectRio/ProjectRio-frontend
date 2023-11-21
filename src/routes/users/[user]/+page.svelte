<script lang="ts">
    import { page } from '$app/stores';
</script>

<h1>UNDER CONSTRUCTION</h1>

<p>{$page.params.user}'s profile page. This page will contain a player profile with a table of recent games, a small preview of offensive/defensive stats and a link to the detailed table, and other user-related content.</p>

<a href={`${$page.params.user}/batting`}>batting stats</a>
<a href={`${$page.params.user}/pitching`}>pitching stats</a>