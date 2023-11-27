import { logger } from "#root/logger.js";
import { predict } from "#root/predict.js";
import { Language, translate } from "#root/translate.js";
import { downloadImage, isFooocosAlive, uploadPhoto } from "#root/utils.js";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { Bot, Context, InlineKeyboard, InlineQueryResultBuilder, InputMediaBuilder } from "grammy";

const activeTasks = new Map<number, boolean>();

const articlePhoto = {
    url: "https://i.imgur.com/oAWNcVt.jpg",
    width: 512,
    height: 512
};

async function handleInlineQuery(ctx: Context) {
    if (!await isFooocosAlive()) {
        const answer = InlineQueryResultBuilder.article('fooocos:down', "Сервис недоступен")
            .text('Сервис временно недоступен. Попробуйте позже');
        return ctx.answerInlineQuery([answer], { cache_time: 0 });
    }

    const userId = Number(ctx.update.inline_query?.from.id);
    const prompt = ctx.inlineQuery?.query;

    if (activeTasks.get(userId)) {
        logger.trace(`${userId} in activeTasks`);
        return ctx.answerInlineQuery([]);
    }

    const answer = prompt ?
        InlineQueryResultBuilder.photo(`fooocos:query:prompt`, articlePhoto.url, {
            caption: prompt,
            thumbnail_url: articlePhoto.url,
            photo_width: articlePhoto.width,
            photo_height: articlePhoto.height,
            reply_markup: new InlineKeyboard()
                .switchInlineCurrent('Вы в очереди')
        }) :
        InlineQueryResultBuilder.article('fooocos:query', 'введите промпт', {
            reply_markup: new InlineKeyboard()
                .switchInlineCurrent('Попробовать снова')
        })
            .text('Нет промпта');

    return ctx.answerInlineQuery([answer], { cache_time: 0 });
}

async function handleChosenInlineResult(ctx: Context) {
    const userId = ctx.update.chosen_inline_result?.from.id!;
    const messageId = ctx.chosenInlineResult?.inline_message_id!;
    const prompt = ctx.chosenInlineResult?.query!;

    if (!prompt) {
        return ctx.api.editMessageTextInline(messageId, "Ошибка: нет промпта. Попробуй ещё раз!");
    }

    activeTasks.set(userId, true);

    let translatedPrompt;

    try {
        translatedPrompt = await translate(prompt, Language.en, Language.auto);
    } catch (err) {
        logger.warn(err, "prompt translation error");
        translatedPrompt = prompt;
    }

    logger.trace({ prompt, translatedPrompt });

    const gen = predict(translatedPrompt);

    for await (const state of gen) {
        if (state.status === "RUNNING") {
            if (state.preview) {
                const previewImage = Buffer.from(state.preview, 'base64');
                const fileId = await uploadPhoto(ctx, previewImage);
                const media = InputMediaBuilder.photo(fileId, {
                    caption: `Промпт: ${prompt}`
                });

                try {
                    await ctx.api.editMessageMediaInline(messageId, media);
                } catch (err) {
                    activeTasks.delete(userId);
                    return;
                }
            }
        } else if (state.status === "SUCCESS") {
            const resultImage = await downloadImage(state.result![0]);
            const fileId = await uploadPhoto(ctx, resultImage);
            const media = InputMediaBuilder.photo(fileId, {
                caption: `Промпт: ${prompt}`
            });
            activeTasks.delete(userId);
            return ctx.api.editMessageMediaInline(messageId, media);
        } else if (state.status === 'ERROR') {
            activeTasks.delete(userId);
            logger.error('ERROR: failed to generate image');
        }
    }
}

export function createBot(token: string) {
    const bot = new Bot(token);
    bot.api.config.use(apiThrottler());
    const protectedBot = bot.errorBoundary((err) => logger.error(err));
    protectedBot.on('chosen_inline_result', handleChosenInlineResult);
    protectedBot.on('inline_query', handleInlineQuery);
    return bot;
}