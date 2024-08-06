import path from "node:path";
import fs from "node:fs";
import { getRepoName } from "./git-cmd.js";
import { isDir } from "./utils.js";

const repositories: Array<Repository> = [];

async function scanRepositories(baseDirs: Array<string>) {
    if (baseDirs.length === 0) return;
    baseDirs.forEach(baseDir => {
        fs.readdir(baseDir, (err, files) => {
            if (err) {
                throw new Error('[scanRepositories] Scan failed: ' + err);
            }
            
            files && files.forEach(subDir => {
                const cwd = path.join(baseDir, subDir);
                if (isDir(cwd)) {
                    let msg = `[scanRepositories] ${cwd} --> `;
                    getRepoName(cwd)
                    .then(repoName => {
                        if (repoName) {
                            repositories.push({ name: repoName, cwd });
                            console.log(msg + 'Repo found : ' + repoName);
                        }
                        else
                            console.log(msg + 'No repo found.');
                    })
                    .catch();   //'fatal: No remote configured to list refs from.\n'
                }
            })
        });
    });
}

export { repositories, scanRepositories };