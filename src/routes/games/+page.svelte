<script lang="ts">
    export let data
</script>

<h1>Games</h1>

<p>Showing {data.length} data.</p>

<ul>
  {#each data as data}
    <li>
      <a href="/games/{data.slug}">{data.title}</a>
    </li>
  {/each}
</ul>