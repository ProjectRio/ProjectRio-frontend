import {GET, USER_ENDPOINTS} from "$lib/constants";
export async function getAllUsers() {
    const response = await GET(USER_ENDPOINTS.USER_ALL)
    const res = await response;
    return res.users;
}