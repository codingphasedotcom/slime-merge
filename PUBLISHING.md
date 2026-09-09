# Publishing updates

Edit the source files at the project root: index.html, style.css, and game.js.

1. Run `npm test` and `npm run build`. The build gives CSS and JavaScript content-based filenames so updated releases load fresh assets.
2. Reuse the Sites project identified in `.openai/hosting.json`. Never register a replacement site for updates.
3. Obtain a fresh source write credential from Sites when the previous one expires. Commit and push this project to the source repository returned by Sites using temporary per-command authentication.
4. Read the exact pushed HEAD with `git rev-parse --verify HEAD`, package the static dist directory through the Sites hosting helper, save a version, and deploy it to the same project.
5. Wait for successful deployment. The game keeps the same URL. Earlier saved versions can be redeployed to roll back.

Ask Codex to “publish the latest game updates” to carry out this process. Editing files alone does not deploy them. Keep credentials out of files and Git configuration.

The current game saves world progress only during a page session. Reloading or opening a new release starts a new game.
