export const getAllPlaylists = async (accum, offset = 0, music) => {
    try {
        const boop = await music.api.library.playlists(null, { offset });
        if (!boop.length) {
            return accum;
        }
        accum = [...accum, ...boop];
        return getAllPlaylists(accum, offset + 25, music);
    } catch (error) {
        console.log('error');
        return accum;
    }
};

const addTracksToPlaylist = async (playlistID, tracks) => {
    const body = {
        data: tracks.map((track) => ({ id: track.id, type: track.type }))
    };

    const req = await fetch(
        `https://api.music.apple.com/v1/me/library/playlists/${playlistID}/tracks`,
        {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                Authorization: `Bearer ${data.jwt}`,
                'music-user-token': music.musicUserToken,
                'Content-Type': 'application/json'
            }
        }
    );

    const boop = await req.json();
    return boop;
};

export const createPlaylist = async (name, tracks) => {
    const body = {
        attributes: {
            description: `A playlist generated by Pacesetter on ${new Date().toLocaleDateString()}`,
            name
        }
    };

    const req = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            Authorization: `Bearer ${data.jwt}`,
            'music-user-token': music.musicUserToken,
            'Content-Type': 'application/json'
        }
    });

    const boop = await req.json();

    await addTracksToPlaylist(boop.data[0].id, tracks);
    console.log('createPlaylist boop', boop);
};

export const trimToDuration = (tracks) => {
    console.log('tracks', tracks);
    // Shuffle everything
    // Reduce until time met
    const shuffledTracks = shuffle([...tracks]);
    const x = shuffledTracks.reduce(
        (accum, track) => {
            if (accum.duration < targetDurationInMS) {
                return {
                    tracks: [track, ...accum.tracks],
                    duration: accum.duration + track.attributes.durationInMillis
                };
            }
            return accum;
        },
        { tracks: [], duration: 0 }
    );
    console.log('x', x);
    return x.tracks;
};
