import { redirect } from '@sveltejs/kit';
import {BACKEND, GET, USER_ENDPOINTS} from '$lib/constants';
import {username} from "$lib/stores/user";
// export const actions = {
//     default: async ({ event }) => {
//         const jwt = event.cookies.get('jwt')
//         console.log(jwt)
//         if (!jwt) {
//             throw redirect(302, '/login')

//         }
//         const response = await GET(USER_ENDPOINTS.LOGOUT)
//         console.log(response.json())
//         event.cookies.delete('jwt')
//         console.log(event.cookies.get('jwt'))
//         throw redirect(302, '/')
//     }
// }

export async function load({ cookies }) {
        const jwt = cookies.get('jwt')
        if (!jwt) {
                throw redirect(302, '/login')

        }
        const response = await GET(USER_ENDPOINTS.LOGOUT)
        const res = await response
        // console.log(res)
        cookies.delete('jwt', {path: '/'})
        console.log(cookies.get('jwt'))
        // return res
        throw redirect(302, '/logout/success')
}

// export async function load({fetch, cookies}) {
//         const jwt = cookies.get('jwt')
//         console.log(jwt)
//         if (!jwt) {
//             throw redirect(302, '/')
//
//         }
//         const response = await fetch(BACKEND + USER_ENDPOINTS.LOGOUT)
//         const res = await response.json()
//         console.log(res)
//
//         cookies.delete('jwt')
//         console.log(cookies.get('jwt'))
//
//         return res
//     }

// export const actions = {
//     default: async ({cookies}) => {
//         const jwt = cookies.get('jwt')
//         if (!jwt) {
//             throw redirect(302, '/')
//         }
//
//         const response = await GET(USER_ENDPOINTS.LOGOUT)
//         const res = await response
//         console.log(res)
//     }
// }