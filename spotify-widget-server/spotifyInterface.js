const rp = require('request-promise');
const OAuth = require('./oauth');
module.exports = function() {

	this.getLast50Songs = function(user) {
		
		// https://developer.spotify.com/documentation/web-api/reference/player/get-recently-played/	


	
		return new Promise( (resolve, reject) => {

				if (!user && !user.SpotifyAuth) {
					// no user, return
					reject("user not passed in, or not logged in to google or spotify");
				} else {
					
					// check if user's spotify access token is valid
					let getToken = {};
					if (user.SpotifyAuth.expiresAt.getTime() >  Date.now()){
						// token is valid
						console.log("<--");
						console.log(`token is valid`);
						console.log(`expires: ${user.SpotifyAuth.expiresAt}`);
						console.log(`now: ${new Date()}`);
						console.log("-->");
						getToken = new Promise(resolve => resolve(user));
						
					} else {
						// refresh token, then go
						console.log("<--");
						console.log(`token is expired`);
						console.log(`expires: ${user.SpotifyAuth.expiresAt}`);
						console.log(`now: ${new Date()}`);
						console.log("-->");
						getToken = OAuth.renewToken(user);
						
						
					}

					getToken.then((user) => {
						
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

						return rp(call)
							.then((response) => {
								resolve(response);		
							})
							.catch((err) => {
								// try reauthorizing and retrying request only one time
								// TODO
								console.log(err);
								reject("Couldn't get info - is user authorized?");
								
							});
					});
					

					
				}

		});
		

	};


};
