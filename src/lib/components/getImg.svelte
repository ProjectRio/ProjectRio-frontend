<script lang="ts">
    //Nuche17: workaround to get images to load. Long term solution involves messing with config files which I don't understand.
    export let imgURL: string;

</script>

<img src={imgURL} alt="Image of {imgURL}">