// This is a fetch function that attaches the users JWT to all requests
export async function apiFetch(route: string, options: any, debug=false) {
  try {    
    // stringify JSON body
    options.body = JSON.stringify(options.body)

    // get jwt
    const jwt = localStorage.getItem("jwt");

    // check for JWT
    if (jwt) {
      // add credentials and headers fields to options to signal JWT being attached
      options.headers['Authorization'] = `Bearer ${jwt}`;
    }

    if (debug) {
      console.log(options)
    };
    
    const response = await fetch('https://api.projectrio.app' + route, options);
    // const response = await fetch('http://127.0.0.1:5000' + route, options);

    if (debug) {
      console.log(response);
    }

    if (response.ok) {
      const json = await response.json();
      
      if (debug) {
        console.log(json);
      }

      // return json payload
      return json;
    }
    
  } catch (error) {
    return error;
  }
};