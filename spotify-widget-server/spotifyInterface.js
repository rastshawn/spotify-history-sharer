const rp = require('request-promise');
module.exports = function() {

	this.getLast50Songs = function(user) {
		
		// https://developer.spotify.com/documentation/web-api/reference/player/get-recently-played/	


	
		return new Promise( (resolve, reject) => {

				if (!user) {
					// no user, return
					reject("user not passed in, or not logged in");
				} else {
					let call = {
						method: 'get',
						uri: 'https://api.spotify.com/v1/me/player/recently-played',
						qs: { // query string params
							limit: '50' // 50 is max
							// before : 'unixTimestamp',
							// after : 'unixTimestamp
						},
						headers: {
							'Authorization': 'Bearer ' + user.SpotifyAuth.accessToken
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
							console.log(err);
							reject("Couldn't get info - is user authorized?");
						});
				}

		});
		

	};


};
