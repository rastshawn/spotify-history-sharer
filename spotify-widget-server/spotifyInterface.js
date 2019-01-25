module.exports = function(rp) {

	this.getLast50Songs = function(userObj) {
		// userObj must contain the access token as userObj.accessToken
		// https://developer.spotify.com/documentation/web-api/reference/player/get-recently-played/	


	
		return new Promise( (resolve, reject) => {

				let call = {
					method: 'get',
					uri: 'https://api.spotify.com/v1/me/player/recently-played',
					qs: { // query string params
						 limit: '50' // 50 is max
						// before : 'unixTimestamp',
						// after : 'unixTimestamp
					},
					headers: {
						'Authorization': 'Bearer ' + userObj.authObj.accessToken
					},
					json: true	
				};

				rp(call)
					.then((response) => {
						resolve(response);		
					})
					.catch((err) => {
						// try reauthorizing and retrying request only one time
						// TODO

						reject("Couldn't get info - is user authorized?");
					});

		});
		

	};


};
