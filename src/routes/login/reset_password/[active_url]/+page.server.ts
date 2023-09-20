import { z } from 'zod'
import { superValidate } from 'sveltekit-superforms/server'
import {ChangePassword} from '$lib/zodSchema'
import { fail, redirect } from '@sveltejs/kit';
import {BACKEND, EMAIL_CHARACTER_LIMIT, USER_ENDPOINTS} from '$lib/constants';
import type {Actions, PageServerLoad} from './$types'
import { username } from '$lib/stores/user'

const ChangePass = ChangePassword.pick({
    active_url: true,
    password: true,
})

// extract the inferred type
type ChangePass = z.infer<typeof ChangePass>
// { username: string }

// on page load, check for jwt and redirect if jwt present
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const load = async ({ event, params }) => {
    // const jwt = event.cookies.get('jwt')
    // if (jwt) throw redirect(302, '/');
    //
    const form = await superValidate(event, ChangePass);
    return {
        form,
        params,
    };
};

export const actions = {
    default: async ({ cookies, request, fetch }) => {
        const form = await superValidate(request, ChangePass);
        console.log(form.data)
        // Convenient validation check:
        if (!form.valid) {
            // Again, always return { form } and things will just work. (superforms comment)
            return fail(400, { form });
        }
        // fetch request
        const response = await fetch(BACKEND + USER_ENDPOINTS.CHANGE_PASSWORD, {
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

