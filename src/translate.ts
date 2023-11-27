import { randomUUID } from 'node:crypto';

// https://yandex.com/dev/translate/doc/en/concepts/api-overview
export enum Language {
    auto = '',
    zh_cn = 'zh',
    zh_tw = 'zh',
    en = 'en',
    ja = 'ja',
    ko = 'ko',
    fr = 'fr',
    es = 'es',
    ru = 'ru',
    de = 'de',
    it = 'it',
    tr = 'tr',
    pt_pt = 'pt',
    pt_br = 'pt',
    vi = 'vi',
    id = 'id',
    th = 'th',
    ms = 'ms',
    ar = 'ar',
    hi = 'hi',
    nb_no = 'no',
    nn_no = 'no',
    fa = 'fa',
}

export async function translate(text: string, to: Language, from: Language) {
    const url = 'https://translate.yandex.net/api/v1/tr.json/translate';
    const query = new URLSearchParams({
        id: randomUUID().replaceAll('-', '') + '-0-0',
        srv: 'android',
    });

    const res = await fetch(`${url}?${query}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            source_lang: from,
            target_lang: to,
            text
        }),
    });

    if (res.ok) {
        const result = await res.json();
        if (result.text) {
            return result.text[0];
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${await res.text()}`;
    }
}