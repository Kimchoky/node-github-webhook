import fs from 'node:fs';
import { IncomingMessage } from "http";
import { update } from "./git-cmd.js";
import { repositories } from './managing.js';
import path from 'node:path';
import pm2 from './pm2.js';

/** parses request body */
function getBody(request: IncomingMessage): Promise<string>  {
    return new Promise((resolve) => {
        const bodyParts: Uint8Array[] = [];
        let body;
        request.on('data', (chunk) => {
            bodyParts.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(bodyParts).toString();
            resolve(body);
        })
    });
}

export function handleWebhookRequest(req: IncomingMessage): boolean {

    const isGithubEvent = req.headers?.['x-github-event'];
    if (isGithubEvent) {
        console.log('# GitHub Webhook request ');
        getBody(req)
        .then(async bodyStr => {
            const body = JSON.parse(bodyStr);
            const repoName = body?.repository?.name + '';    // 'svelte-on-vercel'
            const branchPath = body?.ref;   // 'refs/heads/test'
            const pusherName = body?.pusher?.name;
            const pusherEmail = body?.pusher?.email;
            console.log(`  - from : ${repoName??'?'} - ${branchPath??'?'} pushed by [${pusherName??'?'}(${pusherEmail??'?'})]`)

            if (!repoName || !branchPath || !pusherName) {
                console.warn('Looks like request is from GitHub, no push data found.');
                return;
            }

            const repo = repositories.find(r => r.name === repoName);
            if (!repo) {
                console.warn(`No managed repository found: [${repoName}]`);
            }
            else {
                const branchName = path.basename(branchPath);
                console.log(`Updating --> Repository: [${repoName}], Branch: [${branchName}]`);

                // TODO: provide how to restart an app.
                await pm2.stop(repo.name);
                await update(repo, branchName);
                await pm2.start(repo.name);
                
            }
        });

        return true;
    }
    else 
        return false;
}