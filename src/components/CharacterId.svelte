// File: src/routes/api/characters.ts
<script lang="ts">
import {apiFetch} from "../fetch/apiFetch";
interface Character {
    char_id: number;
    name: string;
}

export async function getCharacters(): Promise<Character[]> {
    try {
    const response = await apiFetch("/characters/", () => {
        method: 'GET'
    });
    const data = await response.json();

    // Extract char_id and name for each character
    const characters: Character[] = data.characters.map((character: any) => ({
    char_id: character[5],
    name: character[character.length - 12]
}));

    return characters;
} catch (error) {
    console.log(error);
    return [];
}
}
</script>