import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { communitySponsor } from '$lib/zodSchema';
import { fail, redirect } from '@sveltejs/kit';
import { BACKEND, COMMUNITY_ENDPOINTS } from '$lib/constants';
import type { Actions, PageServerLoad } from './$types';

// infer type of schema

const commSponsor = communitySponsor.pick({
    community_name: true,
    action: true
})

type commSponsor = z.infer<typeof commSponsor>

// on page load, check for jwt and redirect if jwt present
export const load = (async ({ fetch, cookies }) => {
    const jwt = cookies.get('jwt')
    if (!jwt) throw redirect(302, '/login');

    const form = await superValidate(commSponsor);
    return {
        form,
        
    };
}) satisfies PageServerLoad;

// on submit if form is valid, Sponsor community. if not, throw error
export const actions = {
    default: async ({ cookies, request, fetch }) => {
        const form = await superValidate(request, commSponsor);

        // Convenient validation check:
        if (!form.valid) {
            // Again, always return { form } and things will just work. (superforms comment)
            return fail(400, { form });
        }
        
        // console.log(form.data)
        // fetch request
        // console.log(BACKEND + COMMUNITY_ENDPOINTS.COMMUNITY_SPONSOR)
        const response = await fetch(BACKEND + COMMUNITY_ENDPOINTS.COMMUNITY_SPONSOR, {
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            body: JSON.stringify(form.data),
        })
        
        // console.log(response.status)
        // if community creation unsuccessful
        if (response.status !== 200) {
            // const reader = response.body && response.body.getReader();
            // const errorObj = {};
            // const reading = true;
            // while (reading) {
            //   const { done, value } = await reader.read().catch(() => ({ done: true }));
            //   if (done) break;
            //   const val = new TextDecoder().decode(value);
            //   errorObj[val] = val;
            // }
            //
            return fail(response.status, { form, error: errorObj });
          }
          
        const res = await response.json();
        const sponsor = res.sponsor
        console.log(sponsor)
        // if community creation successful
        if (response.status === 200) {
            // Handle the response as needed
            // console.log(res)
            return {
                form, sponsor: sponsor,
            }

        }
        /* Yep, return { form } here too (apparently superforms really wants you to return forms)
        return form and any other relevant data
        TODO: Add any additional data you want to return */
            return {
                form, sponsor: sponsor,
            }
    }
} satisfies Actions;
