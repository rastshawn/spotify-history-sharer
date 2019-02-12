module.exports = {
    last50 : function(last50){
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
                name : name,
                artists : artists,
                albumArt : albumArt
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
    }

};