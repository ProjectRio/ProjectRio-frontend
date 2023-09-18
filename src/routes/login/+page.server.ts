import { z } from 'zod'
import { superValidate } from 'sveltekit-superforms/server'
import { User } from '$lib/zodSchema'
import { fail, redirect } from '@sveltejs/kit';
import { BACKEND, USER_ENDPOINTS } from '$lib/constants';
import type { Actions } from './$types'
import { username } from '$lib/stores/user'

// assign schema for form
const userLogin = User.pick({
    Email: true,
    Password: true
})

// infer type of schema
type userLogin = z.infer<typeof userLogin>

// on page load, check for jwt and redirect if jwt present
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const load = async (event) => {
	// const jwt = event.cookies.get('jwt')
	// if (jwt) throw redirect(302, '/');
	//
    const form = await superValidate(event, userLogin);
	return {
		form
	};
  };

// on submit if form is valid, login. if not, throw error
export const actions = {
    default: async ({ cookies, request, fetch }) => {
        const form = await superValidate(request, userLogin);
        
        // Convenient validation check:
        if (!form.valid) {
            // Again, always return { form } and things will just work. (superforms comment)
            return fail(400, { form });
        }

        // fetch request 
        const response = await fetch(BACKEND + USER_ENDPOINTS.LOGIN, {
            headers: {'Content-Type': 'application/json'},
            method: "POST",
            body: JSON.stringify(form.data),
        })

        // if login unsuccessful
        if (response.status !== 200) {

                // this is all just a way to parse the html error received. I'm still not certain if I intend to do anything with it or not yet, since a generic error might be all that's needed.
                // const reader = response.body?.getReader()
                // const reading = true;
                // const errorObj = {}
                // while (reading) {
                //     const { done, value } = await reader?.read()
                //     if (done) break
                //     const val = new TextDecoder().decode(value)
                //     errorObj[val] = val
                // }
                // return error
                return fail(response.status, { form })

        }
        const res = await response.json();

        // if login successful
        if (response.status === 200) {
            console.log(res)
            // if login includes jwt
            if (res.access_token) {
                const jwt = res.access_token

                // add jwt to cookies
                cookies.set('jwt', jwt, {
                    path: '/',
                    httpOnly: false,
                    maxAge: 60 * 60 * 24 * 7
                })
            }

            if (res.username) {
                username.set(res.username)
            }
            return {
                form: form,
                msg: res.msg,
                username: res.username
            }
        }
        /* Yep, return { form } here too (apparently superforms really wants you to return forms)
        return username and form/msg
        TODO: if we want to be able to access the name of the user, might need to store the username somewhere. Possible locations are events.locals, a store, maybe even just a sqlite database? */ 
        return {
            success: true,
            form: form,
            msg: res.msg,
            username: res.username
        }
    }
} satisfies Actions;