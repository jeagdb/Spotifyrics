module.exports = {
  getPlaylists: async (spotifyApi) => {
    return spotifyApi.getUserPlaylists()
    .then(
      data => {
        return data.body.items;
      },
      error => {
        console.log(error);
        return null;
      }
    );
  },
  getTracks: async (spotifyApi, playlistId) => {
    return spotifyApi.getPlaylistTracks(playlistId, {
        offset: 1,
        limit: 15,
      })
      .then(
        data => {
          return data.body.items;
        },
        err => {
          console.log("Something went wrong!", err);
          return null;
        }
      );
  },
  getLyrics: async () => {
  }
};
