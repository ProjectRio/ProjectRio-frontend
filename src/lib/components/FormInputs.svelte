<script lang="ts">
    import Meter from "./InputElements/Meter.svelte";
    import Input from "./InputElements/Input.svelte";
    // export let field: string = "input";
    export let type: string = "text";
    export let fieldArray: string[] = [];
    export let typeArray: string[] = [];
    export let name: string = "";
    export let alwaysLabel: boolean = false;
    export let divWrapper: boolean = false;
    export let nameArray: string[] = [];


</script>

<!-- {#if divWrapper}
<div>
{/if} -->

{#each fieldArray as fieldType, i}
    {#if alwaysLabel}
        <label for={nameArray[i]}>{nameArray[i]}</label>
    {/if}

    {#if fieldType == "button"}
        <button>{nameArray[i]}</button>
    {:else if fieldType == "datalist"}
        <datalist id={nameArray[i]}>
            <!-- Add your options here -->
        </datalist>
    {:else if fieldType == "fieldset"}
        <fieldset>
            <legend>{nameArray[i]}</legend>
            <!-- Add your form elements here -->
        </fieldset>
    {:else if fieldType == "input"}
        {#if !alwaysLabel}
            <label for={nameArray[i]}>{nameArray[i]}</label>
        {/if}
        <Input />
    {:else if fieldType == "label"}
        <label for={nameArray[i]}>{nameArray[i]}</label>
    {:else if fieldType == "legend"}
        <legend>{nameArray[i]}</legend>
    {:else if fieldType == "meter"}
        <Meter />
    {:else if fieldType == "optgroup"}
        <optgroup></optgroup>
    {:else if fieldType == "option"}
        <option></option>
    {:else if fieldType == "output"}
        <output></output>
    {:else if fieldType == "progress"}
        <progress></progress>
    {:else if fieldType == "select"}
        <select></select>
    {:else if fieldType == "textarea"}
        <textarea></textarea>
    {/if}
{/each}
<!-- {#if divWrapper}
<div>
{/if} -->
