export async function apiCall(category: string, params: string="") {
    const url = `https://api.projectrio.app/${category}/?${params}`;
    const response = await fetch(url);
    return await response.json();
}