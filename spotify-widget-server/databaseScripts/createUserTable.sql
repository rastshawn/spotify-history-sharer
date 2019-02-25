use TrackRecord;

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    GoogleUserID VARCHAR(50) NOT NULL UNIQUE KEY,
    SpotifyAccessToken VARCHAR(512),
    SpotifyAuthExpiration DATETIME,
    SpotifyRefreshToken VARCHAR(512),
    NextHistoryUpdate DATETIME
);