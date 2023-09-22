import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { Community } from '$lib/zodSchema';
import { fail, redirect } from '@sveltejs/kit';
import { BACKEND, COMMUNITY_ENDPOINTS } from '$lib/constants';
import type { Actions } from './$types';

// assign schema for form
const communityCreate = Community.pick({
    community_name: true,
    type: true,
    private: true,
    global_link: true,
    desc: true
})

// infer type of schema
type communityCreate = z.infer<typeof communityCreate>

// on page load, check for jwt and redirect if jwt present
export const load = async ({ event, cookies, fetch }) => {
    const jwt = cookies.get('jwt')
    console.log(jwt)
    if (!jwt) throw redirect(302, '/login');

    const form = await superValidate(event, communityCreate);
    return {
        form
    };
};

// on submit if form is valid, create community. if not, throw error
export const actions = {
    default: async ({ request, fetch }) => {
        const form = await superValidate(request, communityCreate);

        // Convenient validation check:
        if (!form.valid) {
            // Again, always return { form } and things will just work. (superforms comment)
            return fail(400, { form });
        }
        
        // console.log(form.data)
        if (!form.data.private) {
            form.data.private = false
            form.data.global_link = false;
            console.log(form.data)
        }

        if (!form.data.global_link) {
            form.data.global_link = false

            console.log(form.data)
        }
        // fetch request
        console.log(BACKEND + COMMUNITY_ENDPOINTS.COMMUNITY_CREATE)
        const response = await fetch(BACKEND + COMMUNITY_ENDPOINTS.COMMUNITY_CREATE, {
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            body: JSON.stringify(form.data),
        })
        
        console.log(response.status)
        // console.log('response', request.headers)
        // if community creation unsuccessful
        if (response.status !== 200) {
            // {
            //     // this is all just a way to parse the html error received. I'm still not certain if I intend to do anything with it or not yet, since a generic error might be all that's needed.
            //     const reader = response.body?.getReader()
            //     const reading = true;
            //     const errorObj = {}
            //     while (reading) {
            //         const { done, value } = await reader?.read()
            //         if (done) break
            //         const val = new TextDecoder().decode(value)
            //         errorObj[val] = val
            //     }
                // return error
                return fail(response.status, { failed: true, form: form })
            // }
        }
        const res = await response.json();

        // if community creation successful
        if (response.status === 200) {
            // Handle the response as needed
            console.log(res)
        /* Yep, return { form } here too (apparently superforms really wants you to return forms)
        return form and any other relevant data
        TODO: Add any additional data you want to return */
        return {
            success: true,
            form: form,
        }
    }
    }
} satisfies Actions;
