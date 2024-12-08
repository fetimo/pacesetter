<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { key } from '$lib/api';
	import { genreToBPM, shuffle } from '$lib/conversion';

	enum State {
		READY = 1,
		PROVIDER_LOADING = 9,
		PROVIDER_LOADED = 10,
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
	}

	type Provider = {
		init: Function;
		login: Function;
		logout: Function;
		createPlaylist: Function;
		getPlaylist: Function;
		getPlaylists: Function;
		getTracksFromPlaylist: Function;
	};

	// let service: Service = Service.None;
	let provider: Provider;

	const service = writable(Service.None);
	const state = writable(State.READY);
	const playlists = writable([]);
	const playlist = writable();
	const playlistName = writable('');
	const total = writable();
	const progress = writable(0);
	const targetDuration = writable(30);
	const tracksy = writable([]);

	$: targetDurationInMS = $targetDuration * 60000;

	async function createPlaylist() {
		state.set(State.PLAYLIST_SAVING);
		await provider.createPlaylist({
			name: $playlistName,
			tracks: $tracksy
		});
		state.set(State.PLAYLIST_SAVED);
	}

	async function logout() {
		state.set(State.READY);
		service.set(Service.None);
		sessionStorage.removeItem('service');
		return provider.logout();
	}

	async function setService(event) {
		const value = Number(event.target.value);
		service.set(value);

		if (value === Service.Apple) {
			provider = (await import('$lib/apple')).default;
		}

		await provider.init();
		sessionStorage.setItem('service', value.toString());
		state.set(State.PLAYLISTS_LOADING);
		const pl = await provider.getPlaylists();
		playlists.set(pl);
		state.set(State.PLAYLISTS_LOADED);
		return service;
	}

	async function parsePlaylist() {
                progress.set(0);
		playlist.subscribe(async (pl) => {
			state.set(State.TRACKS_LOADING);
			let tracks = await provider.getTracksFromPlaylist(pl);
			total.set(tracks.length);
			tracks = trimToDuration(tracks);

			const promises = tracks.map(async (track) => {
				const bpm = track.tempo ? { tempo: track.tempo } : await searchTrack(track);
				return {
					...track,
					isIndeterminate: !bpm.tempo,
					tempo: Number(Math.round(bpm.tempo)) || genreToBPM(track.attributes.genreNames[0])
				};
			});

			promises.forEach((p) => p.then(() => progress.update((n) => n + 1)));

			tracks = Promise.all(promises).then((results) => {
				tracks = results
					.sort((a, b) => a.tempo - b.tempo)
					.reduceRight((acc, val, i) => {
						return i % 2 === 0 ? [...acc, val] : [val, ...acc];
					}, []);
				tracksy.set(tracks);

				state.set(State.TRACKS_LOADED);
			});
		});
	}

	async function handleSelectPlaylist(event) {
		const pl = await provider.getPlaylist(event.target.value);
		playlist.set(pl);
		state.set(State.PLAYLIST_SELECTED);
		parsePlaylist();
	}

	function trimToDuration(tracks) {
		// Shuffle everything
		// Reduce until time met
		const shuffledTracks = shuffle(tracks);
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
	}

	const searchTrack = async (track) => {
		const req = await fetch(
			`/bpm?track=${encodeURIComponent(track.attributes.name)}&artist=${encodeURIComponent(
				track.attributes.artistName
			)}`
		);

		const res = await req.json();

		return res;
	};

	onMount(() => {
		const prevService = sessionStorage.getItem('service');
		if (prevService) {
			setService({
				target: {
					value: prevService
				}
			});
		}
	});

	setContext(key, {
		createPlaylist,
		handleSelectPlaylist,
		logout,
		parsePlaylist,
		playlistName,
		playlists,
		progress,
		service,
		Service,
		setService,
		state,
		State,
		targetDuration,
		total,
		tracks: tracksy
	});
</script>

<slot />
