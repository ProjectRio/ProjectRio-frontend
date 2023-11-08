<script>
	import { characters } from "$lib/helpers/characterName";
    import { sortableTableAction } from "svelte-legos";
</script>

<table class="table table-hover table-compact" use:sortableTableAction>
    <thead>
        <tr>
            <th>Batting</th>
            <th>Pitching</th>
        </tr>
    </thead>
    <tbody>
        { #each Object.values(characters) as char }
        <tr>
            <td><a href={`/characters/${char}/batting`}>{char} Batting</a></td>
            <td><a href={`/characters/${char}/pitching`}>{char} Pitching</a></td>
        </tr>
        {/each}
    </tbody>
</table>
