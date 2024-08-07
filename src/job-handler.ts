import { IncomingMessage } from "node:http";
import { getBody } from "./utils.js";
import { repositories } from "./managing.js";
import pm2 from "./pm2.js";

export function isJobRequest(req: IncomingMessage): boolean {
    const isJobRequest = req.headers?.['x-job-event'];
    return !!isJobRequest;
}

export async function handleJobRequest(req: IncomingMessage): Promise<object> {

    console.log('# Job request :');
    const body: JobRequest = await getBody(req).then(async bodyStr => JSON.parse(bodyStr));

    console.log(`  name: ${body.name??'?'}, type: ${body.type}, action: ${body.action}`);
    
    const repo = repositories.find(r => r.name === body.repo);
    if (!repo) {
        console.warn(`No managed repository found: [${body.repo}]`);
        return { ok: false };
    }
    
    if (body.action === 'stop') {
        console.log(` Stopping App: [${body.repo}] ...`);
        await pm2.stop(repo.name);
    }

    return { ok: true };
}