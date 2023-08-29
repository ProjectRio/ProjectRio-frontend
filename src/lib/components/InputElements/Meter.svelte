<script lang="ts">
    export let meterValue: number = 0;
    export let meterMin: number = 0;
    export let meterMax: number = 100;
    export let name: string = "";
</script>

<!-- todo - figure out how to pass name from elsewhere -->
<meter value={meterValue} min={meterMin} max={meterMax}>
{name}
</meter>