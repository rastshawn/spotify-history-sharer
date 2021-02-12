// modified from NestJS Auth demo
import { Injectable, HttpService } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { AuthService } from 'src/auth/auth.service';
import { PassportModule } from '@nestjs/passport';

@Injectable()
export class SongDataService {
  constructor(private httpService: HttpService, private databaseService: DatabaseService, private jwtService: JwtService, private authService: AuthService) {}



  async getHistory(userID, from, to) {
    
    const databaseSongList = 
      await this.databaseService.getHistoryByGoogleID(userID, from, to) as Array<DatabaseSpotifyTrack>;
  
    if (databaseSongList.length == 0){
      return [];
    }

    const spotifyTrackInfo = 
      await this.getSpotifyTracksInfo(databaseSongList);

    // copy play history data into spotify track info
    for (let i = 0; i<spotifyTrackInfo.length; i++) {
      spotifyTrackInfo[i].PlayedAt = databaseSongList[i].PlayedAt;
    }

    return spotifyTrackInfo;
    
  }

  async getSpotifyTracksInfo(trackIDs: Array<DatabaseSpotifyTrack>) {
    // service can only handle 50 at a time; batch

    const authCode = await this.authService.getSpotifyServerAuthCode();

    if (trackIDs.length < 50) {

      const commaSeparatedList = trackIDs.map(track => track.SpotifyTrackID).join();
      const call = {
        method: 'get' as any,
        url: `https://api.spotify.com/v1/tracks?ids=${commaSeparatedList}`,
        // qs: { // query string params
        //   ids: commaSeparatedList
        // },
        headers: {
          'Authorization': 'Bearer ' + authCode,
        }
      };

      try {
        const apiResponse = await this.httpService.request(call).toPromise();
        return apiResponse.data.tracks;
      } catch (e) {
        console.log(call);
        console.log(e);
        return []; // TODO
      }
    } else {
      let first50 = [];
			let remaining = [];
			
			for (let i = 0; i<trackIDs.length; i++){
				if (i<49){
					first50.push(trackIDs[i]);
				} else {
					remaining.push(trackIDs[i]);
				}
      }
      
      const results = await Promise.all([
				this.getSpotifyTracksInfo(first50),
				this.getSpotifyTracksInfo(remaining)
      ]);
      
      return results[0].concat(results[1]);
    }

  }

  async getLast50(userID) {
    const authCode = await this.authService.fetchSpotifyAccessCode(userID);
    let call = {
      method: 'get' as any,
      url: 'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      headers: {
        'Authorization': 'Bearer ' + authCode
      }	
    };

    const response = await this.httpService.request(call).toPromise(); 
    return response.data;
  }

  async fetchPlaylists(userID) {
    const spotifyAccountData = await this.authService.fetchSpotifyAccountData(userID);
    
    let call = {
      method: 'get' as any,
      url: 'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      headers: {
        'Authorization': 'Bearer ' + spotifyAccountDataauthCode
      }	
    };

    const response = await this.httpService.request(call).toPromise(); 
    return response.data;
  }
  }

}

export interface DatabaseSpotifyTrack {
  SpotifyTrackID: string;
  PlayedAt: string;
}