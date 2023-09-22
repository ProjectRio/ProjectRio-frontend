export const load = async ({ fetch }) => {

    // live update the current version
    const response = await fetch("https://github.com/ProjectRio/ProjectRio/releases/latest")
    const latest = response.url
    const latestVersion = latest.substring(latest.lastIndexOf('/') + 1);
    return {
        latest: latestVersion
    }
}