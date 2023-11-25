import { isDev } from "#root/utils.js";
import { LoggerOptions, pino } from "pino";
import PinoPretty, { PrettyOptions } from "pino-pretty";

const options: LoggerOptions = {
    level: isDev() ? 'trace' : 'info'
};

const prettyOptions: PrettyOptions = {
    ignore: 'pid,hostname',
    colorize: isDev() ? true : false,
    translateTime: 'SYS:dd.mm.yyyy, HH:MM:ss'
};

// @ts-ignore
export let logger = pino(options, PinoPretty(prettyOptions));