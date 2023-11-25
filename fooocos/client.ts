import createClient from "openapi-fetch";
import { paths } from './schema.js';

export const fooocos = createClient<paths>({
    baseUrl: process.env["FOOOCOS_API_URL"]
});