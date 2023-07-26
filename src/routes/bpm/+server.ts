import { json } from '@sveltejs/kit';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { PUBLIC_SPOTIFY_CLIENT_ID } from '$env/static/public';
import { SPOTIFY_CLIENT_SECRET } from '$env/static/private';

export async function GET(context) {
    const spotify = SpotifyApi.withClientCredentials(PUBLIC_SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
    const url = new URL(context.request.url);
    const q = `*%20track:${encodeURIComponent(url.searchParams.get('track') || '')}%20artist:${encodeURIComponent(url.searchParams.get('artist') || '')}`;
    const res = await spotify.search(q, ['track'], 'GB', 1);

    const track = res.tracks.items[0];

    if (track) {
        const features = await spotify.tracks.audioFeatures(track.id);
        return json(features);
    }

    return json({});
}