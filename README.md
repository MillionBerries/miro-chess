# Miro Chess App

## About Miro Chess App

The app (for Miro platform) was build for a Miro x Junction hackathon over the course of two evenings. 

Being otherwise busy with studies and work, our team wanted to do something fun and explore capabilities of the Miro platform.

For that, we created a chess game in Miro. It provides an age-proof, mind-stimulating game for Miro users to use **frictionlessly** within their favorite collaboration platform in between meetings. 

We managed to achieve a rather frictionless experience and found out that Miro provides quite a flexible way to develop apps. But it wasn't easy – see challenges in development below.

### Features:
- Fully functioning chess game within Miro. Built using Miro elements only.
- Multiplayer is possible – anyone on the board can play on any board, chess rules will be enforced.
- Finished game notification
- Scores for Black and White sides

### Challenges in development

- Documentation of Miro platform could be improved. The coverage of technical descriptions and specifications is lacking/
- The API appeared to be cluttered and non-uniform
- Polluted browser console logs coming from the Miro web app 




## How to start locally

**&nbsp;ℹ&nbsp;Note**:

- We recommend a Chromium-based web browser for local development with HTTP. \
  Safari enforces HTTPS; therefore, it doesn't allow localhost through HTTP.
  Multiplayer was not possible in Firefox browser


- Run `npm i` to install dependencies.
- Run `npm start` to start developing. \
  Your URL should be similar to this example:
 ```
 http://localhost:3000
 ```
- Paste the URL under **App URL** in your
  [app settings](https://developers.miro.com/docs/build-your-first-hello-world-app#step-3-configure-your-app-in-miro).
- Open a board; you should see your app in the app toolbar or in the **Apps**
  panel.

### How to build the app

- Run `npm run build`. \
  This generates a static output inside [`dist/`](./dist), which you can host on a static hosting
  service.

