function getJWT(name: string) {
  const value = `; ${localStorage.get('csrf_access_token')}`;
  const parts: any = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

// This is a fetch function that attaches the users JWT to all requests
export async function apiFetch(route: string, options: any, debug=false) {
  try {
    // get jwt
    // const jwt = localStorage.getItem("jwt");
    const jwt = true;

    // check for JWT
    if (jwt) {
      // add credentials and headers fields to options to signal JWT being attached
      options.credentials = 'same-origin';
      options.headers['X-CSRF-TOKEN'] = getJWT('csrf_access_token');

      // add jwt to body
      options.body.jwt = "";
    }
    
    if (debug) {
      console.log(options)
    };
    
    // stringify JSON body
    options.body = JSON.stringify(options.body)

    const response = await fetch('https://api.projectrio.app' + route, options);
    
    if (debug) {
      console.log(response);
    }

    if (response.ok) {
      const json = await response.json();
      
      if (debug) {
        console.log(json.access_token);
        console.log(json);
      }

      // return json payload
      return json;
    }
    
  } catch (error) {
    return error;
  }
};