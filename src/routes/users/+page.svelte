<script lang="ts">
	import { getAllUsers } from "$lib/helpers/allUsers";
	import { onMount } from "svelte";
    import { sortableTableAction } from "svelte-legos";

    let allUsers: [];
    onMount(async () => {
        allUsers = await getAllUsers();
    })
</script>

        { #if allUsers }
            <table class="table table-hover table-compact" use:sortableTableAction>
                <thead>
                    <tr>
                        <th>Batting</th>
                        <th>Pitching</th>
                    </tr>
                </thead>
                <tbody>
                    { #each Object.values(allUsers) as user }
                    <tr>
                        <td><a href={`/users/${user}/batting`}>{user} Batting</a></td>
                        <td><a href={`/users/${user}/pitching`}>{user} Pitching</a></td>
                    </tr>
                    { /each }
                </tbody>
            </table>
        { /if }
