# PyStep: learn Python in a 3D world

No build step. Upload all files to the root of a GitHub repo and the website runs directly in the browser.

## Run the website (PWA)
1. Upload every file from this zip to the root of your repo (branch `main`).
2. Settings > Pages > Source: **Deploy from a branch** > Branch: `main`, folder `/ (root)` > Save.
3. Wait about 1 minute, then open `https://<your-username>.github.io/<repo-name>/`.
4. On your phone choose **Install app** or **Add to Home screen**.

No GitHub Actions needed for this.

## Android APK (optional)
`android-apk.yml` is a copy. GitHub only runs workflows from `.github/workflows/`.
Repo > Add file > Create new file > name: `.github/workflows/android-apk.yml` > paste the content > Commit.
Then Actions tab > Build Android APK > Run workflow > download the `pystep-debug-apk` artifact.

## Notes
- Needs internet the first time (React, Three.js and Python load from CDNs). After that it is cached for offline use.
- To test on your computer, run `python3 -m http.server` in this folder and open http://localhost:8000 (opening index.html by double click does not work in browsers).
- Add lessons: add a line `L(title, explanation, starterCode, expectedOutput)` in `curriculum.js`.
