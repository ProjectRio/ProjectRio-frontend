<!--<section>-->
<!--  <a href="login">Login</a>-->
<!--  &lt;!&ndash; <a href="community/create">Create Community</a> &ndash;&gt;-->
<!--  <a href="tagset/all">View Tagsets</a>-->
<!--  <a href="games/ongoing">Ongoing Games</a>-->
<!--</section>-->

<script lang="ts">
  import rio from '../lib/images/RioLogo.png';

</script>

<section>
  <h1>
        <span class="welcome">
            <picture>
                <source srcset={rio} type="image/png">
                <img src={rio} alt="Rio">
            </picture>
        </span>

    RioWeb
  </h1>

  <h2>
    Welcome to the <strong>Project Rio</strong> webpage. It is currently a work in progress, but we are excited about what it will be.
  </h2>

  <!--    <Counter />-->
</section>

<style>
  /* section{*/
  /*  display: grid;*/
  /*} */
  
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }

  h1 {
    width: 100%;
  }

  .welcome {
    display: block;
    position: relative;
    width: 100%;
    height: 0;
    padding: 0 0 calc(100% * 495 / 2048) 0;
  }

  .welcome img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: block;
    object-fit: contain;
  }
</style>
