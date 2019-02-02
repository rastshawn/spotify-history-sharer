module.exports = class User {
    
    constructor(googleAccount, spotifyAuthInfo) {
        this.googleAccount = googleAccount;
        this.spotifyAuthInfo = spotifyAuthInfo;
    }

    get GoogleAccount() {
        return this.googleAccount;
    }

    set GoogleAccount(googleAccount) {
        this.googleAccount = googleAccount;
    }

    get SpotifyAuth() {
        return this.spotifyAuthInfo;
    }

    set SpotifyAuth(spotifyAuth) {
        this.spotifyAuthInfo = spotifyAuth;
    }
}