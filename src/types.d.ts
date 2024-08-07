interface BuildManage {
    repoName: string,
    branchName: string,
}

interface Repository {
    name: string,
    cwd: string,
}

interface JobRequest {
    name?: string,
    type: 'pm2',
    repo: string,
    action: 'restart'|'stop'|'start'
}