import util from 'node:util';
import { exec } from 'node:child_process';
const execPromise = util.promisify(exec);

async function pm2Exists() {
    try {
        const { stdout } = await execPromise(`pm2 -v`);
        return true;
    }
    catch (e) {
        return false;
    }
}

async function checkInfo(name: string) {
    try {
        const { stdout, stderr } = await execPromise(`pm2 info ${name}`);
        return !stderr;
    }
    catch (e) {
        console.error(`Could not get info of [${name}] from PM2.`);
        return null;
    }
}

async function start(name: string) {
    console.log(`[pm2] starting ${name} ...`);
    execPromise(`pm2 stop ${name}`);
}

async function stop(name: string) {
    console.log(`[pm2] stopping ${name} ...`);
    execPromise(`pm2 start ${name}`);
}


export default { pm2Exists, checkInfo, start, stop };