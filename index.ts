import { createBot } from "#root/bot.js";
import { logger } from "#root/logger.js";
import { run } from "@grammyjs/runner";

const main = async () => {
    try {
        const bot = createBot(process.env["BOT_TOKEN"]!);
        await bot.init();
        run(bot);
        logger.info(`Bot @${bot.botInfo.username} (id = ${bot.botInfo.id}) is up and running...`);
    } catch (err) {
        logger.error(err);
    }
};

main();