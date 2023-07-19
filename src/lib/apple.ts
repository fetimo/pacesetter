import type { MusicKit as MusicKitT, Resource } from '@types/musickit-js';

type PacesetterTrack = {
    id: string;
    externalID?: string;
    tempo: number;
    type?: number;
    attributes: {
        name: string;
        artistName: string;
        durationInMillis: string;
        genreNames: string;
    }
};

type PacesetterPlaylist = {

}

type CreatePlaylistArgs = {
    name: string;
    tracks: PacesetterTrack[];
}

type AddTracksToPlaylistArgs = {
    id: string;
    tracks: PacesetterTrack[];
}

let api: MusicKitT;

const getAllPlaylists = async (accum: PacesetterPlaylist[], offset = 0): Promise<PacesetterPlaylist[]> => {
    try {
        const boop = await api.api.library.playlists(null, { offset });
        if (!boop.length) {
            return accum;
        }
        accum = [...accum, ...boop];
        return getAllPlaylists(accum, offset + 25);
    } catch (error) {
        console.log('getAllPlaylists error', error);
        return accum;
    }
};

const addTracksToPlaylist = async ({ id, tracks }: AddTracksToPlaylistArgs) => {
    const body = {
        data: tracks.map((track) => ({ id: track.id, type: track.type }))
    };

    const req = await fetch(
        `https://api.music.apple.com/v1/me/library/playlists/${id}/tracks`,
        {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                Authorization: `Bearer ${api.developerToken}`,
                'music-user-token': api.musicUserToken,
                'Content-Type': 'application/json'
            }
        }
    );

    return req;
};

const AppleMusicProvider = {
    init: async () => {
        const req = await fetch('/apple-token');
        const res = await req.json();

        return new Promise((resolve, reject) => {
            const musickit = document.createElement('script');
            musickit.setAttribute('src', 'https://js-cdn.music.apple.com/musickit/v1/musickit.js');
            document.body.append(musickit);

            document.addEventListener('musickitloaded', async function () {
                MusicKit.configure({
                    developerToken: res.jwt,
                    app: {
                        name: 'pacesetter',
                        build: '1978.4.1'
                    }
                });

                api = MusicKit.getInstance();

                if (!api.isAuthorized) {
                    await api.authorize().catch((error) => {
                        console.log('Apple API error', error)
                        reject(error);
                    });
                }

                resolve(api);
            });
        })
    },
    login: () => api.authorize(),
    logout: () => api.unauthorize(),
    createPlaylist: async ({ name, tracks }: CreatePlaylistArgs) => {
        const body = {
            attributes: {
                description: `A playlist generated by Pacesetter on ${new Date().toLocaleDateString()}`,
                name: name
            }
        };

        const req = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                Authorization: `Bearer ${api.developerToken}`,
                'music-user-token': api.musicUserToken,
                'Content-Type': 'application/json'
            }
        });

        const boop = await req.json();

        await addTracksToPlaylist({ id: boop.data[0].id, tracks });
    },
    getPlaylist: async (id: string) => api.api.library.playlist(id),
    getTracksFromPlaylist: (playlist: Resource) => playlist.relationships.tracks.data,
    getPlaylists: async () => getAllPlaylists([]),
};

export default AppleMusicProvider;