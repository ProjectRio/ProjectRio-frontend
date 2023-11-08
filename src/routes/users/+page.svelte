<script lang="ts">
	import { getAllUsers } from "$lib/helpers/allUsers";
    import { sortableTableAction } from "svelte-legos";

    const allUsers = getAllUsers();
    console.log({allUsers});
</script>

        { #await allUsers }
            <p>Loading</p>
        { :then users }
            <table class="table table-hover table-compact" use:sortableTableAction>
                <thead>
                    <tr>
                        <th>Batting</th>
                        <th>Pitching</th>
                    </tr>
                </thead>
                <tbody>
                    { #each Object.values(users) as user }
                    <tr>
                        <td><a href={`/users/${user}/batting`}>{user} Batting</a></td>
                        <td><a href={`/users/${user}/pitching`}>{user} Pitching</a></td>
                    </tr>
                    { /each }
                </tbody>
            </table>
        { :catch e }
            <p>{e.message}</p>
        { /await }
