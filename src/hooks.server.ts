import { apiFetch } from "./fetch/apiFetch";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  if (event.request.url.pathname === "/login/") {
    // If it's a login request, handle it separately
    if (event.request.method === "POST") {
      try {
        const { Username, Email, Password } = await event.request.json();
        // Perform necessary validation or checks on the inputs

        // Call your login API endpoint using apiFetch
        const loginResult = await apiFetch("/login/", {
          method: "POST",
          body: {
            Username,
            Email,
            Password,
          },
        });

        if (loginResult.access_token) {
          // If login is successful, set the JWT in local storage
          localStorage.setItem("jwt", loginResult.access_token);
          // Redirect the user to the desired page after successful login
          // For example, you can use event.respondWith(Response.redirect("/dashboard"));
          // or event.respondWith(Response.redirect("/")); to redirect to the home page
          // You can customize the destination path based on your application's routes
          return event.respondWith(Response.redirect("/dashboard"));
        } else {
          // If login fails, handle the error and respond accordingly
          // For example, you can return an error page or a JSON response with an error message
          return event.respondWith(new Response("Login failed", { status: 401 }));
        }
      } catch (error) {
        // Handle any errors that occur during the login process
        console.log(error);
        return event.respondWith(new Response("An error occurred", { status: 500 }));
      }
    }
  }

  // If it's not a login request, proceed with the regular handling
  return await resolve(event);
};
