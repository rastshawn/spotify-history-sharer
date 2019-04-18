const rp = require('request-promise');
const OAuth = require('./oauth');
const ImplicitGrant = require('./implicitGrant');
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

	this.getTrackInfoBySpotifyTrackID = async function(spotifyTrackID) {
		// make a call to track info endpoint, using client credentials flow. 

		// TODO Make function that requests access token for non-user info like track info. 
		// https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow

		// call:
		// GET https://api.spotify.com/v1/tracks/{id}
		// info: https://developer.spotify.com/documentation/web-api/reference/tracks/get-track/
	};

	this.getTracksInfoBySpotifyTrackID = function(trackIDs) {

		// max of 50... recursively apply the rest
		
		if (trackIDs.length <= 50) {
			let commaSeparatedList = trackIDs.join();
			// remove last comma
			//commaSeparatedList = commaSeparatedList.substring(0, commaSeparatedList.length - 1);


			return ImplicitGrant.getCode().then((token) => {
						
				let call = {
					method: 'get',
					uri: 'https://api.spotify.com/v1/tracks',
					qs: { // query string params
						ids: commaSeparatedList
					},
					headers: {
						'Authorization': 'Bearer ' + token
					},
					json: true	
				};

				return rp(call)
					.then((response) => {
						return response.tracks;		
					})
					.catch((err) => {
						console.log(err);
						//reject("Couldn't get info - is application authorized?");
						
					});
			});


		} else {
			let first50 = [];
			let remaining = [];
			
			for (let i = 0; i<trackIDs.length; i++){
				if (i<50){
					first50.push(trackIDs[i]);
				} else {
					remaining.push(trackIDs[i]);
				}
			}

			return Promise.all([
				this.getTracksInfoBySpotifyTrackID(first50),
				this.getTracksInfoBySpotifyTrackID(remaining)
			]).then((resultsArray) => {
				return resultsArray[0].concat(resultsArray[1]);
			});
			
		}
	}



};
