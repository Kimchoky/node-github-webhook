import http, { IncomingMessage } from 'node:http';
import { checkGitExists, getCurrentBranchName } from './git-cmd.js'; 
import { handleWebhookRequest, isWebhookRequest } from './webhook-handler.js';
import { scanRepositories } from './managing.js';
import pm2 from './pm2.js';
import { handleJobRequest, isJobRequest } from './job-handler.js';

console.log('process.argv', process.argv);

const scanDirs = process.argv[2]?.split(',');
if (!scanDirs || scanDirs.length === 0) {
    const msg =  `No scan directory provided.
usage)
 $ node dist {SCAN_DIR_1,SCAN_DIR_2,...}
example)
 $ node dist /App,/anotherAppRoot
`;
    throw new Error(msg);
}

const usePm2 = process.argv.findIndex(v => v === '--nopm2') === -1;

scanRepositories(scanDirs);


// init 
await (async () => {
    console.log('# Checking git installed on machine...');
    if (!await checkGitExists())
        throw new Error("No git found!");

    if (usePm2 && !await pm2.pm2Exists())
        throw new Error("No PM2 found!");
    
})();

console.log('# Starting http server...');
const server = http.createServer(async (req, res) => {

    const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
    const pathname = url.pathname;

    console.log('Incoming request URI => ' + pathname);

    let result = null;
    if (isWebhookRequest(req)) {
        result = handleWebhookRequest(req);
    }
    else if (isJobRequest(req)) {
        result = await handleJobRequest(req);
    }
    else {
        console.log('Rejecting request(Non-GitHub Webhook request).');
        res.statusCode = 401;
        result = { oK: false, message: 'Forbidden' };
    }
    
    res.end(JSON.stringify(result));

}).listen(8080);

console.log('# GitHub Webhook watch server started!');