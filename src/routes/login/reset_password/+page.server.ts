import { z } from 'zod'
import { superValidate } from 'sveltekit-superforms/server'
import { ResetPassword } from '$lib/zodSchema'
import { fail, redirect } from '@sveltejs/kit';
import {BACKEND, EMAIL_CHARACTER_LIMIT, USER_ENDPOINTS} from '$lib/constants';
import type { Actions } from './$types'
import { username } from '$lib/stores/user'

const ResetPass = ResetPassword

// extract the inferred type
type ResetPass = z.infer<typeof ResetPass>
// { username: string }

// on page load, check for jwt and redirect if jwt present
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const load = async (event) => {
    // const jwt = event.cookies.get('jwt')
    // if (jwt) throw redirect(302, '/');
    //
    const form = await superValidate(event, ResetPass);
    return {
        form
    };
};

export const actions = {
    default: async ({ cookies, request, fetch }) => {
        const form = await superValidate(request, ResetPass);
        console.log(form.data)
        // Convenient validation check:
        if (!form.valid) {
            // Again, always return { form } and things will just work. (superforms comment)
            return fail(400, { form });
        }
        // fetch request
        const response = await fetch(BACKEND + USER_ENDPOINTS.REQUEST_PASSWORD_CHANGE, {
            headers: {'Content-Type': 'application/json'},
            method: "POST",
            body: JSON.stringify(form.data),
        })

        // if login unsuccessful
        if (response.status !== 200) {

            return fail(response.status, { form })

        }
        const res = await response.json();


        /* Yep, return { form } here too (apparently superforms really wants you to return forms)
        return username and form/msg
        TODO: if we want to be able to access the name of the user, might need to store the username somewhere. Possible locations are events.locals, a store, maybe even just a sqlite database? */
        return {
            success: true,
            form: form,
        }
    }
} satisfies Actions;