module.exports = {


	constructor: function() {

		// has to be passed request-promise library
		// https://www.npmjs.com/package/request-promise

		rp = 'request-promise'; // passed in
	}

	getLast50Songs: function(clientID, userObj) {
		// userObj must contain the access token as userObj.accessToken
		// https://developer.spotify.com/documentation/web-api/reference/player/get-recently-played/	


	
		return new Promise( (resolve, reject) => {

				let call = {
					uri: 'https://api.spotify.com/v1/me/player/recently-played',
					qs: { // query string params
						// limit: '5',
						// before : 'unixTimestamp',
						// after : 'unixTimestamp
					},
					headers: {
						'Authorization': 'Bearer ' + userObj.accessToken
					},
					json: true	
				};

				rp(call)
					.then((response) => {
						resolve(response);		
					})
					.catch((err) => {
						reject(err);
					});

		});
		

	},


};
