import http, { IncomingMessage } from 'http';
import { checkGitExists, getCurrentBranchName } from './git-cmd.js'; 
import { handleWebhookRequest } from './webhook.js';
import { scanRepositories } from './managing.js';
import pm2 from './pm2.js';

//const repositories = process.argv[2].split(',');
const scanDirs = [
    '/Users/tvdi240281/IdeaProjects',
];
scanRepositories(scanDirs);


// init 
await (async () => {
    console.log('# Checking git installed on machine...');
    if (!await checkGitExists())
        throw new Error("No git found!");

    if (!await pm2.pm2Exists())
        throw new Error("No PM2 found!");
    
})();

console.log('# Starting http server...');
const server = http.createServer((req, res) => {

    const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
    const pathname = url.pathname;

    console.log('Incoming request URI => ' + pathname);

    if (handleWebhookRequest(req)) {
        res.end(JSON.stringify({ ok: true }));
    }
    else {
        console.log('Rejecting request(Non-GitHub Webhook request).');
        res.statusCode = 401;
        res.end(JSON.stringify({ oK: false, message: 'Forbidden' }));
    }

}).listen(8080);

console.log('# GitHub Webhook watch server started!');