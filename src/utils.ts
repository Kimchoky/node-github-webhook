import { lstatSync } from "node:fs";
import { IncomingMessage } from "node:http";

export function isDir(path: string) {
    try {
        const stat = lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}



/** parses request body */
export function getBody(request: IncomingMessage): Promise<string>  {
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