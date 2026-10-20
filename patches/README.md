# Share a patch

1. Make something in Strudel Flow. Open **Patches**, give it a name, and click **Export**.
2. Put the downloaded JSON file in this folder. Fill in the empty `author` (your GitHub handle) and `description` fields directly in the JSON.
3. Run `pnpm dev`. Find your patch under **Patches → Community patches** and check that it loads and plays.
4. Commit the JSON file to a branch in your fork, then [open a patch pull request](https://github.com/xyflow/strudel-flow/compare?expand=1&template=patch.md). Choose your fork and branch, fill in the patch template, and use sounds you have permission to share.

The [patch PR template](../.github/PULL_REQUEST_TEMPLATE/patch.md) asks what you made, how to listen, and whether you checked the patch locally. The link above selects this template once it is merged into the repository's default branch.

No registry to edit: JSON files in this folder appear automatically after the app is rebuilt. Search matches the name, creator, and description. See [abbeys-flow.json](abbeys-flow.json) for a complete file.
