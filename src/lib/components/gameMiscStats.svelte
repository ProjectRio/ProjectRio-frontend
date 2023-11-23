<script lang="ts">
    export let roster: any = undefined;

    function compileMiscStats (roster: any[], statTypePath: string, statName: string) {
        let outputText: string = "";
        roster.forEach((character: any) => {
            if (statName in character[statTypePath])
                if (character[statTypePath][statName] > 0) {
                    if (outputText !== "") {outputText += ", "}
                    outputText += character.name + " " + character[statTypePath][statName]
                }
        })
        return outputText
    }

</script>

{#if compileMiscStats(roster, "battingStats", "doubles") !== ""}<br><strong>Doubles:</strong> {compileMiscStats(roster, "battingStats", "doubles")}{/if}
{#if compileMiscStats(roster, "battingStats", "triples") !== ""}<br><strong>Triples:</strong> {compileMiscStats(roster, "battingStats", "triples")}{/if}
{#if compileMiscStats(roster, "battingStats", "perfect_hits") !== ""}<br><strong>Perfect Contacts:</strong> {compileMiscStats(roster, "battingStats", "perfect_hits")}{/if}
{#if compileMiscStats(roster, "fieldingStats", "wall_jumps") !== ""}<br><strong>Wall Jumps:</strong> {compileMiscStats(roster, "fieldingStats", "wall_jumps")}{/if}
{#if compileMiscStats(roster, "fieldingStats", "jump_catches") !== ""}<br><strong>Jump Catches:</strong> {compileMiscStats(roster, "fieldingStats", "jump_catches")}{/if}
{#if compileMiscStats(roster, "fieldingStats", "diving_catches") !== ""}<br><strong>Diving Catches:</strong> {compileMiscStats(roster, "fieldingStats", "diving_catches")}{/if}
{#if compileMiscStats(roster, "fieldingStats", "bobbles") !== ""}<br><strong>Bobbles:</strong> {compileMiscStats(roster, "fieldingStats", "bobbles")}{/if}