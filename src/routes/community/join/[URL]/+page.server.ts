import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail, redirect } from '@sveltejs/kit';
import { BACKEND, COMMUNITY_ENDPOINTS } from '$lib/constants';
import type { Actions } from './$types';

// assign schema for form
const joinCommunity = z.object({
    community_name: z.string(),
    URL: z.string().optional(),
})

// infer type of schema
type joinCommunity = z.infer<typeof joinCommunity>

// on page load, check for jwt and redirect if jwt present

export const load = async ({ event, params }) => {
    // const jwt = event.cookies.get('jwt')
    // if (jwt) throw redirect(302, '/');
    //
    const form = await superValidate(event, joinCommunity);
    return {
        form,
        params,
    };
};

// on submit if form is valid, create community. if not, throw error
export const actions = {
    default: async ({ request, fetch }) => {
        const form = await superValidate(request, joinCommunity);

        // Convenient validation check:
        if (!form.valid) {
            // Again, always return { form } and things will just work. (superforms comment)
            return fail(400, { form });
        }

        if (!form.data.URL) {
            delete form.data.URL;
            console.log(form.data)

        }
        // fetch request
        console.log(BACKEND + COMMUNITY_ENDPOINTS.COMMUNITY_JOIN)
        const response = await fetch(BACKEND + COMMUNITY_ENDPOINTS.COMMUNITY_JOIN, {
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            body: JSON.stringify(form.data),
        })

        console.log(response.status)
        // console.log('response', request.headers)
        // if community creation unsuccessful
        if (response.status !== 200) {
            {
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
            success: true,
            form: form,
            res: res,
        }
    }
} satisfies Actions;
