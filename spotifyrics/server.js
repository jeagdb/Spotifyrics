const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

const app = express();

const { getPlaylists, getTracks } = require("./api/spotify.js")

app.set("view engine", "pug");
app.set("trust proxy", 1);

app.use(express.static("public"));

app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    maxAge: 60000*5
  })
);
app.get("/", function(request, response) {
  response.render("index");
});

////////////////////////////////// DATAS
const redirectUri =
  process.env.PROJECT_DOMAIN + ":5000/callback";
const scopes = [];
const showDialog = true;

let spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: redirectUri
});

let playlists = [];


////////////////////////////////// API

app.get("/authorize", function(request, response) {
  response.header("Access-Control-Allow-Origin", "*");
  let state = crypto.randomBytes(12).toString("hex");
  request.session.state = state;
  let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, showDialog);
  response.redirect(authorizeURL);
});

app.get("/callback", function(request, response) {
  response.header("Access-Control-Allow-Origin", "*");
  if (request.session.state !== request.query.state) {
    response.sendStatus(401);
  }
  let authorizationCode = request.query.code;
  spotifyApi.authorizationCodeGrant(authorizationCode).then(
    data => {
      request.session.access_token = data.body["access_token"];
      response.redirect("/playlists");
    },
    error => {
      console.log(
        "Something went wrong when retrieving the access token!",
        error.message
      );
    }
  );
});

app.get("/logout", function(request, response) {
  request.session.destroy();
  response.redirect("/");
});

app.get("/tracks", async function(request, response) {
  //let songs = await getTracks(spotifyApi, )
});

app.get("/playlists", async function(request, response) {
  //let loggedInSpotifyApi = new SpotifyWebApi();
  await spotifyApi.setAccessToken(request.session.access_token);
  playlists = await getPlaylists(spotifyApi);
  return response.render("playlists", { playlists })
});

let listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
