const spotifyInterface = new (require('./spotifyInterface'))();
module.exports = {
    last50 : async function(last50){
        let data = [];

        for(let i = 0; i<last50.items.length; i++) {
        
            let track = last50.items[i].track;
            let imageURL = '';
            for (let j = 0; j<track.album.images.length; j++){
                
                if (track.album.images[j].height < 100){
                // going for 64, but some are 63
                    imageURL = track.album.images[j].url;
                }
            }
            

            let trackURL = track.external_urls.spotify;
            
            let artistsString = track.artists.map((artist) => {
                return artist.name;
            }).join(', ');
            
            let name = `<a href='${trackURL}'>${track.name}</a>`;
            let artists = artistsString;
            let albumArt = `<img class='album' src='${imageURL}'></img>`;
            
            data.push({
                
                albumArt : albumArt,
                name : name,
                artists : artists
            });
        }

        let fields = [
            "Artwork",
            "Track",
            "Artists"
        ];

        return {
            data : data,
            fields : fields
        };
    }, 

    history : async function(history){

        if (!history || !history.length) {
            return {
                data: {
                    results: "no results"
                },
                fields: [
                    "No results"
                ]
            };
        }

        let promises = [];
        for(let i = 0; i<history.length; i++) {
            
            let track = history[i];
            let imageURL = '';
            for (let j = 0; j<track.album.images.length; j++){
                
                if (track.album.images[j].height < 100){
                // going for 64, but some are 63
                    imageURL = track.album.images[j].url;
                }
            }
            

            let trackURL = track.external_urls.spotify;
            
            let artistsString = track.artists.map((artist) => {
                return artist.name;
            }).join(', ');
            
            let name = `<a href='${trackURL}'>${track.name}</a>`;
            let artists = artistsString;
            let albumArt = `<img class='album' src='${imageURL}'></img>`;
            
            promises.push(new Promise((resolve, reject) => {
                //let name = `${history[i].SpotifyTrackID}`;
                let playedAt = `${history[i].PlayedAt}`;

                resolve({
                    
                    albumArt : albumArt,
                    name : name,
                    artists : artists,
                    playedAt : playedAt
                });
            }));
        }

        let fields = [
            "Artwork",
            "Track",
            "Artists",
            "Listen Date"
        ];

        let data = Promise.all(promises);

        return {
            data : await data,
            fields : fields
        };
        

        
    }

};