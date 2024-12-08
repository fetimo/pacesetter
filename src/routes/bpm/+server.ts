import { json } from '@sveltejs/kit';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { gql, request } from 'graphql-request'
import { PUBLIC_SPOTIFY_CLIENT_ID } from '$env/static/public';
import { CYANITE_ACCESS_TOKEN, SPOTIFY_CLIENT_SECRET } from '$env/static/private';

const query = gql`
mutation SpotifyTrackEnqueueMutation($input: SpotifyTrackEnqueueInput!) {
  spotifyTrackEnqueue(input: $input) {
    __typename
    ... on SpotifyTrackEnqueueSuccess {
      enqueuedSpotifyTrack {
        id
        audioAnalysisV6 {
          __typename
          ...on AudioAnalysisV6Finished{
            result{
              bpmRangeAdjusted
            }
          }
        }
      }
    }
    ... on Error {
      message
    }
  }
}
`

async function getCyaniteResponse(spotifyID: string) {
  // Look up track in Cyanite.
  const res = await request('https://api.cyanite.ai/graphql', query, { 
    input: { 
      spotifyTrackId: spotifyID
    } 
  }, {
    authorization: `Bearer ${CYANITE_ACCESS_TOKEN}`
  });

  return res;
}

export async function GET(context) {
    const spotify = SpotifyApi.withClientCredentials(PUBLIC_SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
    const url = new URL(context.request.url);
    const q = `*%20track:${encodeURIComponent(url.searchParams.get('track') || '')}%20artist:${encodeURIComponent(url.searchParams.get('artist') || '')}`;
    const searchResults = await spotify.search(q, ['track'], 'GB', 1);

    // Look up Spotify ID by using Spotify search API - hopefully it won't get pulled!
    const track = searchResults.tracks.items[0];
    
    if (track) {
        const spotifyID = track.id;

        // Look up track in Cyanite.
        let res = await getCyaniteResponse(spotifyID);

        if (res.spotifyTrackEnqueue.enqueuedSpotifyTrack.audioAnalysisV6.__typename === 'AudioAnalysisV6Enqueued') {
          // Wait.
          setTimeout(async () => {
            console.log("settimeout")
            res = await getCyaniteResponse(spotifyID)
          }, 3000)
        }

        return json({
          tempo: res.spotifyTrackEnqueue.enqueuedSpotifyTrack.audioAnalysisV6.result.bpmRangeAdjusted
        })
    }

    return json({});
}