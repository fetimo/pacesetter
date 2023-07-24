# pacesetter

A small app (built on a quiet Sunday) to take a playlist and create an optimised running mix out of it.

You tell it the duration it needs to last and the playlist to base it on. It matches the BPM of all the songs thanks to Spotify's Track Features API. It then plots the tracks onto a normal distribution curve so the music gets faster towards the middle of the mix and then back down - hopefully perfect for stretches/cool ups/downs.

In the unlikely event a match isn't found for the BPM then it looks at the genre and plucks a random value for that genre that is statistically likely (the UI also indicates this). But that's not great and I might try some other techniques if I use this enough.

Supports Apple Music and Spotify.

## TODO

* Add more types

## .env

You'll need the following:

* APPLE_KID = A 10-character key identifier from your Apple Developer account
* APPLE_TEAM_ID = Your Apple Developer team ID
* APPLE_PRIVATE_KEY = Your p8 certificate from Apple
* PUBLIC_SPOTIFY_CLIENT_ID = Registered Spotify app ID
* SPOTIFY_CLIENT_SECRET = Your Spotify app's secret key