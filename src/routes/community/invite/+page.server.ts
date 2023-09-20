import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
// import { GenericForm } from '$lib/zodSchema';
import { fail, redirect } from '@sveltejs/kit';
import { BACKEND, COMMUNITY_ENDPOINTS } from '$lib/constants';
import type {Actions, PageServerLoad} from './$types';

// // assign schema for form
const GenericForm = z.object({
    community_name: z.string(),
    invite_list: z.array(z.string()).default([]),
    // Add other properties if needed
  });
  
// infer type of schema
// type communityCreate = z.infer<typeof communityCreate>

// on page load, check for jwt and redirect if jwt present
export const load = (async ({ event, fetch, cookies }) => {
    const jwt = cookies.get('jwt')
    if (!jwt) throw redirect(302, '/login');

    const form = await superValidate(event, GenericForm);
    return {
        form
    };
}) satisfies PageServerLoad;

// on submit if form is valid, create community. if not, throw error
export const actions = {
    default: async ({ cookies, request, fetch }) => {
        const form = await superValidate(request, GenericForm);

        // Convenient validation check:
        if (!form.valid) {
            // Again, always return { form } and things will just work. (superforms comment)
            return fail(400, { form });
        }
        
        console.log(form.data)
        // fetch request
        console.log(BACKEND + COMMUNITY_ENDPOINTS.COMMUNITY_INVITE)
        const response = await fetch(BACKEND + COMMUNITY_ENDPOINTS.COMMUNITY_INVITE, {
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            body: JSON.stringify(form.data),
        })
        
        console.log(response.status)
        // if community creation unsuccessful
        if (response.status !== 200) {
            {
                // this is all just a way to parse the html error received. I'm still not certain if I intend to do anything with it or not yet, since a generic error might be all that's needed.
                const reader = response.body?.getReader()
                const reading = true;
                const errorObj = {}
                while (reading) {
                    const { done, value } = await reader?.read()
                    if (done) break
                    const val = new TextDecoder().decode(value)
                    errorObj[val] = val
                }
                // return error
                return fail(response.status, { form })
            }
        }
        const res = await response.json();

        // if community creation successful
        if (response.status === 200) {
            // Handle the response as needed
            console.log(res)
        }

        /* Yep, return { form } here too (apparently superforms really wants you to return forms)
        return form and any other relevant data
        TODO: Add any additional data you want to return */
        return {
            form: form,
            msg: res.msg,
            username: res.username
        }
    }
} satisfies Actions;
