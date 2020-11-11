const express = require("express");
const session = require("express-session");

const router = express.Router();
const crypto = require("crypto");
const SpotifyWebApi = require("spotify-web-api-node");
const Genius = require('genius-lyrics-scrape')
const { getPlaylists, getTracks } = require("../api/spotify");
const { getLyrics } = require("../api/genius");
require("dotenv").config();

const redirectUri = process.env.PROJECT_DOMAIN + "/callback";
const scopes = [];
const showDialog = true;

let spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: redirectUri
});

let client = new Genius.Client(process.env.GENIUS_TOKEN);

let playlists = [];
let playlistsSongs = new Map();
let tokenAccess = "";

router.use(
    session({
      resave: true,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      maxAge: 60000*5
    })
  );

router.get("/", function(request, response) {
    response.render("index");
  });
  
router.get("/authorize", function(request, response) {
    let state = crypto.randomBytes(12).toString("hex");
    request.session.state = state;
    let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, showDialog);
    response.redirect(authorizeURL);
  });
  
router.get("/callback", function(request, response) {
    if (request.session.state !== request.query.state) {
      response.sendStatus(401);
    }
    let authorizationCode = request.query.code;
    spotifyApi.authorizationCodeGrant(authorizationCode).then(
      data => {
        request.session.access_token = data.body["access_token"];
        tokenAccess = request.session.access_token;
        response.redirect("/playlists");
      },
      error => {
        console.log("Something went wrong when retrieving the access token!")
        response.render("/error", { error });
      }
    );
  });
  
router.get("/back", function(request, response) {
    response.render("playlists", { playlists, playlistsSongs });
  });
  
router.get("/logout", function(request, response) {
    request.session.destroy();
    response.redirect("/");
  });
  
router.get("/lyrics", async function(request, response){
    let songName = request.query.name.toLowerCase();
    let songArtist = request.query.artist.toLowerCase();
  
    let lyrics = await getLyrics(client, songName, songArtist);
    if (lyrics === undefined || lyrics === '') {
      response.render("lyrics", { lyrics : '', author: songArtist, songName });
      return;
    }
    lyrics = lyrics.replace(/\n\n/g, '$')
    let splitLyrics = lyrics.split("$");
    response.render("lyrics", { lyrics : splitLyrics, author: songArtist, songName });
  });
  
router.get("/tracks", async function(request, response) {
    spotifyApi.setAccessToken(tokenAccess);
    for (playlist of playlists) {
      let songs = await getTracks(spotifyApi, playlist.id);
      playlistsSongs.set(playlist.id, songs);
    }
    response.render("playlists", { playlists, playlistsSongs })
  });
  
router.get("/playlists", async function(request, response) {
    spotifyApi.setAccessToken(tokenAccess);
    playlists = await getPlaylists(spotifyApi);
    if (playlists === null) {
      response.render("error", { error: "Impossible de récupérer les playlists"})
    } else {
      response.redirect("/tracks");
    }
  });

module.exports = router;