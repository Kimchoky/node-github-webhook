import path from 'node:path';
import fs from 'node:fs';
import util from 'node:util';
import { exec } from 'node:child_process';

const execPromise = util.promisify(exec);

function normalizedDir(cwd: string) {
    return path.resolve('/', path.normalize(cwd));
}

async function checkGitExists(): Promise<boolean> {
    const { stdout, stderr } = await execPromise('git --version');
    return stderr === '';
}

async function getCurrentBranchName(cwd: string) {
    const opt = { cwd: normalizedDir(cwd) };
    const { stdout } = await execPromise(`git branch --show-current`, opt)
    return stdout;
}

async function revertCurrent(cwd: string) {
    const opt = { cwd: normalizedDir(cwd) };
    const commands = [
        `git restore .`,
        `git clean --force -d -x`,
        `git reset --hard .`,
    ];
    console.log(`[git] reverting ...`);
    const { stdout } = await execPromise(commands.join(' && '), opt);
}

async function pullBranch(cwd: string, branch: string) {
    const opt = { cwd: normalizedDir(cwd) };
    const commands = [
        `git switch ${branch}`,
        `git pull`
    ];
    console.log(`[git] pulling ...`);
    const { stdout } = await execPromise(commands.join(' && '), opt);
}

async function npmBuild(cwd: string) {
    const opt = { cwd: normalizedDir(cwd) };
    const commands = [
        `npm install`,
        `npm run build`
    ];
    console.log(`[npm] installing / building ...`);
    const { stdout } = await execPromise(commands.join(' && '), opt);
}


async function update(repo: Repository, branchName: string) {
    await revertCurrent(repo.cwd);
    await pullBranch(repo.cwd, branchName);
    await npmBuild(repo.cwd);
    console.log(` ${repo.name}/${branchName} updated and built.`);
}

async function getRepoName(cwd: string) {
    const opt = { cwd: normalizedDir(cwd) };

    const gitDir = path.join(cwd, '.git');
    if (!fs.existsSync(gitDir)) // no git dir found
        return null;

    try {
        const { stdout } = await execPromise('git ls-remote --get-url', opt)
        const repoName = path.basename(stdout).split('.')[0];   // https://github.com/{ID}/{REPONAME}.git
        return repoName;
    } 
    catch (e) {
        console.warn(` failed to get Repo from [${cwd}].\n`, e)
        return null;
    }
}

export { checkGitExists, getCurrentBranchName, getRepoName, update }