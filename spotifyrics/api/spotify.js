module.exports = {
  getPlaylists: async (spotifyApi) => {
    console.log("playlists");
    return spotifyApi.getUserPlaylists().then(
      data => {
        console.log(data.body.items);
        console.log("XXXXXXXXXXXXXXXX");
        return data.body.items;
      },
      error => {
        console.log(error);
        return null;
      }
    );
  },
  getTracks: async (spotifyApi, playlistId) => {
    return spotifyApi
      .getPlaylistTracks(playlistId, {
        offset: 1,
        limit: 5,
        fields: "items"
      })
      .then(
        data => {
          console.log("The playlist contains these tracks", data.body);
        },
        err => {
          console.log("Something went wrong!", err);
        }
      );
  }
};
