import { lstatSync } from "node:fs";

export function isDir(path: string) {
    try {
        const stat = lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}