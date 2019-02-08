module.exports = {
    getHTML : function(last50){
    
let style = `
<style>
.mainWindow {
    overflow: auto;
    max-height: 100vh;
}
.songRow {
    height: 70px;
}
.album {
    width:64px;
    height:64px;
    margin: 4;
}
.text {
    text-overflow: ellipsis;
    white-spaace: nowrap;
    overflow: hidden;
    display: inline;
}
</style>`;

let mainBox = `<div class='mainWindow'>`;

for(let i = 0; i<last50.items.length; i++) {
   
    let track = last50.items[i].track;
    
    let imageURL = '';
    for (let j = 0; j<track.album.images.length; j++){
        
        if (track.album.images[j].height == 64){
           
            imageURL = track.album.images[j].url;
        }
    }
    
    let name = track.name;
    let trackURL = track.href;
    
    let artistsString = track.artists.map((artist) => {
        
        return artist.name;
    }).join(', ');

    let rowHTML = `
    <div class='songRow'>
        <img class='album' src='${imageURL}'></img>
        <div class='text'><a href='${trackURL}'>${name}</a></div>
        <div class='text'>${artistsString}</div>
    </div>`;
    
    mainBox += rowHTML;
    
}

mainBox += '</div>';

let HTML = style + mainBox;


return HTML;

}

};