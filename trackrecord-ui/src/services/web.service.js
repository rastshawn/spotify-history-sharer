// import { uri } from 'config';
const uri = "http://localhost:6001";
let bearerToken = '';
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
        bearerToken = json.access_token;
        return json;
    },


    async makeCall(endpoint, method='GET', json=false, body) {
        
        if (!bearerToken) {
            // TODO kick user back to login screen
        }

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
    }

}