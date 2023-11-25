import { fooocos } from "#fooocos/client.js";
import { components } from "#fooocos/schema.js";
import { textToImageBody } from "#root/body.js";
import { logger } from "#root/logger.js";
import { sleep } from "#root/utils.js";

type Text2ImgRequest = components["schemas"]["Text2ImgRequest"];
type AsyncJobResponse = components["schemas"]["AsyncJobResponse"];

type PredictStatus = "WAITING" | "RUNNING" | "SUCCESS" | "ERROR";

type PredictResponse = {
    status: PredictStatus,
    jobId: number,
    preview?: string,
    result?: string[];
};

export async function* predict(prompt: string): AsyncGenerator<PredictResponse> {
    const defaultBody = textToImageBody(prompt) as Text2ImgRequest;
    const response = await fooocos.POST('/v1/generation/text-to-image', {
        body: defaultBody
    });

    if (response.error) throw response.error;

    const data = response.data as AsyncJobResponse;

    while (true) {
        const poll = await fooocos.GET('/v1/generation/query-job', {
            params: {
                query: {
                    job_id: data.job_id,
                    require_step_preivew: true
                }
            }
        });

        if (poll.error) throw poll.error;

        const status = poll.data.job_stage;

        if (status === "WAITING") {
            logger.trace(`job id ${poll.data.job_id} is waiting`);
            yield { status: 'WAITING', jobId: poll.data.job_id };
        } else if (status === "RUNNING") {
            logger.trace(`job id ${poll.data.job_id} is running`);
            const stepPreview = poll.data.job_step_preview!;
            yield { status: 'RUNNING', jobId: poll.data.job_id, preview: stepPreview };
        } else if (status === 'SUCCESS') {
            logger.trace(`job id ${poll.data.job_id} is success`);
            const imageUrls: string[] = [];
            if (poll.data.job_result) {
                for (let image of poll.data.job_result) {
                    imageUrls.push(image.url!.replace('http://127.0.0.1:8888', process.env["FOOOCOS_API_URL"]!));
                }
            }
            yield { status: 'SUCCESS', jobId: poll.data.job_id, result: imageUrls };
            break;
        } else if (status === 'ERROR') {
            logger.trace(`job id ${poll.data.job_id} is error`);
            yield { status: 'ERROR', jobId: poll.data.job_id };
            break;
        }

        await sleep(3000);
    }
}