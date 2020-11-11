module.exports = {
    getLyrics: async (client, title, artist ) => {
      return await client.searchAPI(title)
      .then(searchRes => { 
        let songFound = searchRes.result.find(song => {
          return song.title.toLowerCase() === title && song.primaryArtist.name.toLowerCase() === artist
        });
        if (songFound !== undefined) {
          return client.scrapeLyrics(songFound.url)
            .then(lyricsRes => {
              return lyricsRes;
            })
            .catch(err => {
              console.log('scrapeLyrics err: ', err);
              return '';
            });
        }
      })
      .catch(err => {
        console.log('searchSong err: ', err);
        return '';
      });
    }
};


