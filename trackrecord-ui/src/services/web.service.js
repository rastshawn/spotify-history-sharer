const makeCall = async function(endpoint, method='GET', json=false, body) {
    const bearerToken = localStorage.getItem("jwt");
    if (!bearerToken) {
        // TODO kick user back to login screen
    }

    try {
        let response = await fetch(
            endpoint,
            {
                method: method,
                body: (method == 'GET') ? null : JSON.stringify({
                    body
                }),
                cache: 'no-cache',
                headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${bearerToken}`
                }
            }
            );
        
        if (json)
            response = await response.json();
        else   
            response = await response.text();
        return response;
        } catch (e) {
            // TODO catch unauthorized and redirect to login screen

            console.log(e);
        }
};


const sendAuthToken = async function(googleUser) {
    // grab ID token
    // This is because the object member that contains the token
    // keeps inexplicably changing, breaking my code. 
    // example - googleUser.wc.id_token one week, googleUser.uc.id_token the next
    let id_token = '';
    for (member in googleUser) {
        if (googleUser[member].id_token) {
            id_token = googleUser[member].id_token;
        }
    }
    const response = await fetch(
        `/api/auth/google/oauth`,
        {
            method: 'POST',
            body: JSON.stringify({
                idtoken: id_token
            }),
            cache: 'no-cache',
            headers: {
            'Content-Type' : 'application/json'
            }
        }
        );

    let json = await response.json();
    let googleUserID = undefined;
    for (var prop in googleUser) {
        if (typeof googleUser[prop] == "string"){
            googleUserID = googleUser[prop];
        }
    }
    localStorage.setItem("jwt", json.access_token);
    localStorage.setItem("googleUserID", googleUser.Ca); // if this doesn't work in a month, find a new solution
    return json;
};
const updateSpotifyAccount = async function(body) {
    /*
    const body = {
      userID: this.$route.query.state,
      code: this.$route.query.code
    };
    */
    let json = await makeCall('/api/auth/spotify/saveCode', 'POST', true, body);
    localStorage.setItem("jwt", json.access_token);

    return json;
};


module.exports = {
    updateSpotifyAccount,
    sendAuthToken,
    makeCall
}