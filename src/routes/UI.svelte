<script>
	import { getContext } from 'svelte';
	import { key } from '$lib/api';

	const {
		createPlaylist,
		handleSelectPlaylist,
		logout,
		playlist,
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
		tracks
	} = getContext(key);
</script>

<section class="container">
	<hgroup>
		<h1>Welcome to Pacesetter</h1>
		<h2>Create the perfect exercise playlist from music you love</h2>
	</hgroup>
	{#if !$service}
		<h5>Choose your music provider</h5>
		<button value={Service.Apple} on:click={setService}>Apple Music</button>
		<button value={Service.Spotify} on:click={setService}>Spotify</button>
		<p><small>Psst, you might need to allow popups for login to work</small></p>
	{:else}
		<button on:click={logout}>Logout</button>

		<label for="targetDuration">Target duration</label>
		<input
			type="number"
			step="5"
			min="5"
			id="targetDuration"
			name="targetDuration"
			placeholder="Time in minutes"
			bind:value={$targetDuration}
			required
		/>
		<small>Enter the number of minutes you want the playlist to last.</small>
	{/if}

	{#if $state === State.PLAYLISTS_LOADED}
		<details role="list">
			<summary aria-haspopup="listbox">
				{$playlist?.attributes?.name || 'Select playlist to analyse'}
			</summary>
			<ul role="listbox" class="scroll">
				{#each $playlists as playlist}
					<li>
						<label for={playlist.id}>
							<input
								type="radio"
								id={playlist.id}
								name="playlistID"
								value={playlist.id}
								on:change={handleSelectPlaylist}
							/>
							{playlist?.attributes?.name}
						</label>
					</li>
				{/each}
			</ul>
		</details>
	{/if}

	{#if $state === State.PLAYLISTS_LOADING}
		<p aria-busy="true">Loading your playlists&hellip;</p>
	{/if}
	{#if $state === State.TRACKS_LOADING}
		<progress value={$progress} max={$total} />
	{/if}

	{#if $state === State.TRACKS_LOADED || $state === State.PLAYLIST_SAVING || $state === State.PLAYLIST_SAVED}
		<ol>
			{#each $tracks as track}
				<li>
					{track.attributes.name}
					<small>
						({track.tempo || ''}{#if track.isIndeterminate}<span data-tooltip="Estimated BPM"
								>*</span
							>{/if})
					</small>
				</li>
			{/each}
		</ol>

		<label for="playlistName">Name your playlist</label>
		<input
			type="text"
			id="playlistName"
			name="playlistName"
			placeholder="Playlist name"
			bind:value={$playlistName}
		/>

		<button
			type="submit"
			on:click={createPlaylist}
			aria-busy={$state === State.PLAYLIST_SAVING}
			disabled={$state === State.PLAYLIST_SAVING || $state === State.PLAYLIST_SAVED}
		>
			Save playlist
		</button>
		<a class="secondary" data-sveltekit-reload href="/" role="button">Start over</a>
	{/if}
</section>

<style>
	.scroll {
		overflow: scroll;
		height: 50vh;
		min-height: 10rem;
	}
</style>
