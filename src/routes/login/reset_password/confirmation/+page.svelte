<script lang="ts">
  import { onMount } from 'svelte'
    import type { PageData } from './$types';
    
    export let data: PageData;

    onMount(() => {
        setTimeout(() => {
        window.location.href = "/login";
    }, 3000);
    });

</script>

<h3>Password Reset Email Sent</h3>
<p>Please check your email for a link to reset your password. You will be redirected to the login page shortly. If you are not automatically redirected, click the link <a href="/login">here.</a></p>
