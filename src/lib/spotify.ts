import type { Playlist } from '@spotify/web-api-ts-sdk'
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT } from '$env/static/public';

let api: SpotifyApi;

type CreatePlaylistArgs = {
    name: string;
    tracks: any[]
}

const SpotifyMusicProvider = {
    init: async () => {
        api = SpotifyApi.withUserAuthorization(
            PUBLIC_SPOTIFY_CLIENT_ID,
            PUBLIC_SPOTIFY_REDIRECT,
            ["playlist-modify-public", "playlist-modify-private"],
        );
    },
    login: async () => api.authenticate(),
    logout: () => window.location.reload(),
    createPlaylist: async ({ name, tracks }: CreatePlaylistArgs) => {
        const user = await api.currentUser.profile();
        const createdPlaylist = await api.playlists.createPlaylist(user.id, {
            name,
            description: `A playlist generated by Pacesetter on ${new Date().toLocaleDateString()}`,
        });

        const uris = tracks.map((track) => track.externalID);
        await api.playlists.addItemsToPlaylist(createdPlaylist.id, uris);
    },
    getPlaylist: async (id: string) => api.playlists.getPlaylist(id),
    getPlaylists: async () => {
        const playlists = await api.currentUser.playlists.playlists();
        return playlists.items.map((playlist) => {
            return {
                id: playlist.id,
                attributes: {
                    name: playlist.name,
                }
            }
        });
    },
    getTracksFromPlaylist: async (playlist: Playlist) => {
        const songs = (await api.playlists.getPlaylistItems(playlist.id));

        return Promise.all(songs.items.map(async (song) => {
            const [track, features] = await Promise.all([
                api.tracks.get(song.track.id),
                api.tracks.audioFeatures(song.track.id)
            ]);

            return {
                id: song.track.id,
                externalID: song.track.uri,
                tempo: Math.round(features.tempo),
                attributes: {
                    name: song.track.name,
                    artistName: track.artists[0].name,
                    durationInMillis: song.track.duration_ms,
                    genreNames: ['']
                }
            };
        }));
    },
};

export default SpotifyMusicProvider;