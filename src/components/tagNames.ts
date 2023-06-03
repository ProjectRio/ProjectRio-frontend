import { tagsets } from '../lib/tagsets';

async function getAllTagSets() {
  try {
    const response = await fetch("https://api.projectrio.app/tag_set/list", {
      method: "POST"
    });
    const result = await response.json();
    tagsets.set(result['Tag Sets']);
    // console.log(result['Tag Sets']);
  } catch (error) {
    console.log(error);
  }
}

export { getAllTagSets };
