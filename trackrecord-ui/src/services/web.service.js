// import { uri } from 'config';
const uri = "http://localhost:6001";
module.exports = {
    async sendAuthToken(googleUser) {
        const response = await fetch(
            `/api/auth/google/oauth`,
            {
                method: 'POST',
                body: JSON.stringify({
                    idtoken: googleUser.wc.id_token
                }),
                cache: 'no-cache',
                headers: {
                'Content-Type' : 'application/json'
                }
            }
            );

        let json = await response.json();
        localStorage.setItem("jwt", json.access_token);
        localStorage.setItem("googleUserID", googleUser.Ca); // if this doesn't work in a month, find a new solution
        return json;
    },


    async makeCall(endpoint, method='GET', json=false, body) {
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
    }

}