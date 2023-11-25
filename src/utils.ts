import { fooocos } from "#fooocos/client.js";
import { Context, InputFile } from "grammy";

export const isDev = () => process.env["NODE_ENV"] === 'development' ? true : false;

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function isFooocosAlive() {
    try {
        await fooocos.GET('/', { parseAs: 'text', signal: AbortSignal.timeout(1000) });
        return true;
    } catch (err) {
        return false;
    }
}

export async function uploadPhoto(ctx: Context, photo: Buffer) {
    const dummyMessage = await ctx.api.sendPhoto(process.env["DUMMY_CHAT_ID"]!, new InputFile(photo));
    const fileId = dummyMessage.photo[dummyMessage.photo.length - 1].file_id;
    return fileId;
}

export async function downloadImage(url: string) {
    const response = await fetch(url)
        .then(r => r.arrayBuffer());
    const buffer = Buffer.from(response);
    return buffer;
}