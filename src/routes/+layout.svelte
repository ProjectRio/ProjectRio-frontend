<script lang="ts">
    import Header from '../components/Header.svelte';
    import './styles.css';
</script>

<div class="app">
    <Header />

    <main>
        <slot />
    </main>

    <footer>
        <!-- <p>visit <a href="https://www.projectrio.online/">projectrio.online</a> for more information about the Rio Client.</p> -->
    </footer>
</div>

<style>
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        justify-content: center;
        align-items: center;
    }

    main {
        flex: 1;
        display: flex;
        flex-direction: column;
        /* justify-content: center; */
        /* align-items: center; */
        padding: 1rem;
        width: 100%;
        max-width: 64rem;
        margin: 0 auto;
        box-sizing: border-box;
    }

    footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 12px;
    }

    footer a {
        font-weight: bold;
    }

    @media (min-width: 480px) {
        footer {
            padding: 12px 0;
        }
    }

</style>