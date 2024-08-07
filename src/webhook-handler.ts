import { IncomingMessage } from "node:http";
import path from 'node:path';
import { update } from "./git-cmd.js";
import { repositories } from './managing.js';
import pm2 from './pm2.js';
import { getBody } from './utils.js';



export function isWebhookRequest(req: IncomingMessage): boolean {
    const isGithubEvent = req.headers?.['x-github-event'];
    return !!isGithubEvent;
}

export function handleWebhookRequest(req: IncomingMessage): object {
    
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
            return { ok: false };
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

    return { ok: true };
}