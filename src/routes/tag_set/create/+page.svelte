<script lang="ts">
    import type {PageData} from './$types';
    import {superForm} from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
    import {UNCATEGORIZED_ENDPOINTS, GET} from "$lib/constants";
    import {AlertTriangle} from 'lucide-svelte';
    import {InputChip, ListBox, ListBoxItem} from '@skeletonlabs/skeleton'

    export let data: PageData;
    export let form;
    import {onMount} from 'svelte';
    import type {ConicStop} from '@skeletonlabs/skeleton';
    import {getAllTagSets} from "$lib/helpers/tagNames";
    import {tagsets} from "$lib/stores/tagsets";
    import {getUserCommunities} from "$lib/helpers/userCommunities";
    import {username} from "$lib/stores/user";

    // Client API:
    const {form: formData, errors, constraints, enhance, delayed} = superForm(data?.form);
    const conicStops: ConicStop[] = [
        {color: 'transparent', start: 0, end: 25},
        {color: 'rgb(var(--color-primary-900))', start: 75, end: 100}
    ];
    let tags = [];
    let tagset = [];
    let tagNames = [];
    let tagIds = [];
    let userCommunities;
    onMount(async () => {
        try {
            const [response, tagSetsResponse, commResponse] = await Promise.all([
                GET(UNCATEGORIZED_ENDPOINTS.TAG_LIST),
                getAllTagSets(),
                getUserCommunities($username)
            ]);

            const res = await response;
            const tagSets = await tagSetsResponse;
            const userComm = await commResponse;

            tags = res.Tags;
            tags.forEach(i => {
                tagNames.push(i.name)
                tagIds.push(i.id)
            })
            console.log(tagNames, tagIds)
            console.log(tags);
            userCommunities = userComm
            console.log(userCommunities)
            // Use tagSets data here
            tagset = $tagsets
            // console.log(tagSets);
        } catch (error) {
            // Handle any errors
            console.error(error);
        }
    });


    let showSelect = false;

    function toggleSelect() {
        showSelect = !showSelect;
        if (!showSelect) {
            $formData.tag_set_id = undefined; // Clear the selection when hiding the select element
        }
    }

</script>
<!--<SuperDebug data={$formData}/>-->
{#if form?.success}
    <p>Game Mode created.</p>
    {#each Object.entries(form.form.data) as [k, v]}
    <!--{#each Object.values(k) as key, val}-->
        <p>
            {k}: {v}
        </p>
        <!--{/each}-->
    {/each}
    <button class="variant-ghost-secondary"><a class="btn btn-primary" href="/tag_set/list">Click here to view a current list of game modes.</a></button>
{:else if form?.failed}
<p>There was an error creating your game mode. Make sure that you are creating it in a community that meets the requirements and let us know if you continue to have problems.</p>
    {:else}
    {#if tags}
        <form method="POST" class="card flex-col" use:enhance>
            {#if $errors._errors}
                <aside class="alert variant-filled-error mt-6">
                    <div>
                        <AlertTriangle size="42"/>
                    </div>
                    <div class="alert-message">
                        <h3 class="h3">{"Form Submission Problem"}</h3>
                        <p>{$errors._errors}</p>
                    </div>
                </aside>
            {/if}

            <div class="m-6">

                <label class="label" for="name">Game Mode Name</label>
                <input
                        class="input text-token"
                        type="text"
                        name="name"

                        aria-invalid={$errors.name ? 'true' : undefined}
                        bind:value={$formData.name}
                        {...$constraints.name}/>
                {#if $errors.name}<small class="invalid">{$errors.name}</small>{/if}
            </div>
            <div class="m-6">

                <label class="label" for="desc">Description</label>
                <textarea
                        class="textarea text-token"
                        row="4"
                        name="desc"
                        placeholder="Enter a brief description of this game mode."
                        aria-invalid={$errors.desc ? 'true' : undefined}
                        bind:value={$formData.desc}
                        {...$constraints.desc}></textarea>
                {#if $errors.desc}<span class="invalid">{$errors.desc}</span>{/if}
            </div>
            <div class="m-6">

                <label class="label" for="type">Type</label>
                <select
                        class="select text-token"
                        name="type"
                        aria-invalid={$errors.type ? 'true' : undefined}
                        bind:value={$formData.type}
                        {...$constraints.type}>
                    <option value="Season" selected>Season</option>
                    <option value="League">League</option>
                    <option value="Tournament">Tournament</option>

                </select>
                {#if $errors.type}<span class="invalid">{$errors.type}</span>{/if}
            </div>
<!--            <div class="m-6">-->

<!--                <label class="label" for="community_name">community name</label>-->
<!--                <input class="input text-token"-->
<!--                       type="text"-->
<!--                       name="community_name"-->

<!--                       aria-invalid={$errors.community_name ? 'true' : undefined}-->
<!--                       bind:value={$formData.community_name}-->
<!--                       {...$constraints.community_name}/>-->
<!--                {#if $errors.community_name}<span class="invalid">{$errors.community_name}</span>{/if}-->
<!--            </div>-->
            {#if userCommunities}
                <div class="m-6">
                    <label class="label" for="community_name">Community Name</label>
                    <select
                            class="input text-token"
                            name="community_name"
                            aria-invalid={$errors.community_name ? 'true' : undefined}
                            bind:value={$formData.community_name}
                            {...$constraints.community_name}>
                        {#each Object.values(userCommunities) as comm}
                            <option value={comm.name}>{comm.name}</option>
                        {/each}
                    </select>
                    {#if $errors.community_name}<span class="invalid">{$errors.community_name}</span>{/if}
                </div>
            {/if}
            <div class="m-6">
                <div class="tags">
                    <label class="label" for="tags">Tags</label>
                    <!--          <select class="select" multiple name="tags" bind:value={$formData.tags} >-->
<!--                    <select class="select" multiple name="tags" bind:value={$formData.tags}>-->

<!--                        {#each tags as tag, index}-->

<!--                            &lt;!&ndash;          <span class="chip variant-soft hover:variant-filled">&ndash;&gt;-->
<!--                            &lt;!&ndash;            <span>(icon)</span>&ndash;&gt;-->
<!--                            &lt;!&ndash;            <span>Action</span>&ndash;&gt;-->
<!--                            &lt;!&ndash;          </span>&ndash;&gt;-->
<!--                            <option value={tag.id}>{tag.name}</option>-->
<!--                        {/each}-->
<!--                    </select>-->
<!--                        <InputChip bind:value={$formData.tags} />-->
                    <div class="flex">
                                <ListBox multiple class="flex-auto">
<!--                                    Not Selected-->
                                    {#each tags as tag, index}
                                        {#if !($formData.tags.includes(tag.id))}

                                            <ListBoxItem bind:group={$formData.tags} name="medium" value={tag.id}>{tag.name}</ListBoxItem>

                                        {/if}
                                    {/each}
                                </ListBox>
                                <ListBox multiple class="flex-auto">
<!--                                    Selected-->
                                    {#each tags as tag, index}
                                        {#if $formData.tags.includes(tag.id)}
                                            <ListBoxItem bind:group={$formData.tags} name="medium" value={tag.id}>{tag.name}</ListBoxItem>
                                        {/if}
                                    {/each}
                                </ListBox>


                    </div>
                    <!--        <select class="select" multiple>-->
                    <!--          {#each tags as tag}-->
                    <!--          <span class="chip variant-soft hover:variant-filled">-->
                    <!--            <span>(icon)</span>-->
                    <!--            <span>Action</span>-->
                    <!--          </span>-->
                    <!--            <option value={tag.name}>{tag.name}</option>-->
                    <!--          {/each}-->

                    <!--        </select>-->
                    {#if $errors.tags}<span class="invalid">{$errors.tags}</span>{/if}
                </div>
<!--                <div class="chips">-->
<!--                    {#each Object.keys($formData.tags) as f}-->
<!--                        <span-->
<!--                                class="chip {f.name ? 'variant-filled' : 'variant-soft'}"-->
<!--                                on:click={() => { f.name; }}-->
<!--                                on:keypress-->
<!--                        >-->
<!--                            {#if f.name}<span>(icon)</span>{/if}-->
<!--                            <span class="capitalize">{f.name}</span>-->
<!--	</span>-->
<!--                    {/each}-->
<!--                </div>-->
                <!--      <div class="chips">-->
                <!--        <InputChip name="tags" bind:value={tags} placeholder="Tags..." />-->

                <!--      </div>-->
            </div>
                <div class="m-6">
                  <div class="tag_set_id">
                      <label>
                          <input class="checkbox" type="checkbox" on:change={toggleSelect} />
                          <span>Base your game mode off of a pre-existing one? (This will not affect any game tags already selected).</span>
                      </label>
                    <label class="label" for="tag_set_id">Game Modes</label>
                      {#if showSelect}

                      <select class="select" name="tag_set_id" bind:value={$formData.tag_set_id}>
                          <option value={0}>Select a game mode...</option>

                          {#each tagset as t}
                      <span class="chip variant-soft hover:variant-filled">
                        <span>(icon)</span>
                        <span>Action</span>
                      </span>
                        <option value={t.id}>{t.name}</option>
                      {/each}

                    </select>
                          {/if}
                    {#if $errors.tag_set_id}<span class="invalid">{$errors.tag_set_id}</span>{/if}
                  </div>

                </div>
            <div class="m-6">
                <label class="label" for="start_date">start date</label>
                <input class="input variant-form-material"
                       type="date"
                       name="start_date"
                       aria-invalid={$errors.start_date ? 'true' : undefined}
                       bind:value={$formData.start_date}
                       {...$constraints.start_date}/>
                {#if $errors.start_date}<span class="invalid">{$errors.start_date}</span>{/if}
            </div>
            <div class="m-6">

                <label class="label" for="end_date">end date</label>
                <input class="input variant-form-material"
                       type="date"
                       name="end_date"
                       aria-invalid={$errors.end_date ? 'true' : undefined}
                       bind:value={$formData.end_date}
                       {...$constraints.end_date}/>
                <!--           on:change={() => $formData.end_date = unixTimeFromDate(new Date($formData.end_date))}-->


                {#if $errors.end_date}<span class="invalid">{$errors.end_date}</span>{/if}
            </div>
            <div class="m-6">
                <button class="btn">Submit</button>
            </div>

            <!--    <button type="submit" class="btn variant-filled-primary w-full"-->
            <!--    >{#if $delayed}<ConicGradient stops={conicStops} spin width="w-6" />{:else}{"submit"}{/if}</button-->
            <!--    >-->
        </form>
    {/if}

{/if}