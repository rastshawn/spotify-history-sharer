use TrackRecord;

CREATE TABLE Listens (
    ListenID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    GoogleUserID VARCHAR(50) NOT NULL,
    FOREIGN KEY (GoogleUserID) 
        REFERENCES Users(GoogleUserID)
        ON UPDATE CASCADE,
    SpotifyTrackID VARCHAR(50) NOT NULL, 
    PlayedAt DATETIME
)