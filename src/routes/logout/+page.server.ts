import { redirect } from '@sveltejs/kit';
import { GET, USER_ENDPOINTS } from '$lib/constants';

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
        cookies.delete('jwt')
        // console.log(cookies.get('jwt'))
        // throw redirect(302, '/')
    }