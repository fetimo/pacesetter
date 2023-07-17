// import { setContext } from 'svelte';
import { genreToBPM, shuffle } from './conversion';

export const key = Symbol();

enum State {
    READY = 1,
    PLAYLISTS_LOADING = 2,
    PLAYLISTS_LOADED = 3,
    PLAYLIST_SELECTED = 4,
    TRACKS_LOADING = 5,
    TRACKS_LOADED = 6,
    PLAYLIST_SAVING = 7,
    PLAYLIST_SAVED = 8
}

enum Service {
    None = 0,
    Apple = 1,
    Spotify = 2,
}

type Provider = {
    init: Function,
    login: Function,
    logout: Function,
    createPlaylist: Function,
    getPlaylist: Function,
    getTracksFromPlaylist: Function
}

let service: Service = Service.None;
let provider: Provider;
let state = State.READY;

async function createPlaylist() {
    return provider.createPlaylist();
}

async function setService(selected: Service) {
    service = selected;
    if (selected === Service.Apple) {
        provider = (await import('$lib/apple')).default
    } else {
        provider = (await import('$lib/spotify')).default
    }
    return service;
}

function setState(newState: State) {
    state = newState;
    return state;
}

async function handleSelectPlaylist() {
    playlist = await provider.getPlaylist();
    state = State.PLAYLIST_SELECTED;
    tracks = provider.getTracksFromPlaylist(playlist);
    tracks = trimToDuration(tracks);

    total = tracks.length;
    state = State.TRACKS_LOADING;

    const promises = tracks.map(async (track) => {
        const bpm = await searchTrack(track);
        return {
            ...track,
            isIndeterminate: !bpm.tempo,
            tempo: Number(bpm.tempo) || genreToBPM(track.attributes.genreNames[0])
        };
    });

    tracks = Promise.all(promises).then((results) => {
        tracks = results
            .sort((a, b) => a.tempo - b.tempo)
            .reduceRight((acc, val, i) => {
                return i % 2 === 0 ? [...acc, val] : [val, ...acc];
            }, []);

        state = State.TRACKS_LOADED;
    });

    promises.forEach((p) => p.then(() => (progress += 1)));
}

function trimToDuration(tracks) {
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
    return x.tracks;
};

const searchTrack = async (track) => {
    const x = await fetch(
        `/bpm?track=${encodeURIComponent(track.attributes.name)}&artist=${encodeURIComponent(
            track.attributes.artistName
        )}`
    );

    const res = await x.json();

    return res;
};
