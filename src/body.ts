export const textToImageBody = (prompt: string) => {
    return {
        "prompt": prompt,
        "negative_prompt": "",
        "style_selections": [
            "Fooocus V2",
            "Fooocus Enhance",
            "Fooocus Sharp"
        ],
        // "Speed" | "Quality" | "Extreme Speed"
        "performance_selection": "Speed",
        "aspect_ratios_selection": "1152×896",
        "image_number": 1,
        "image_seed": -1,
        "sharpness": 2,
        "guidance_scale": 4,
        "base_model_name": "juggernautXL_version6Rundiffusion.safetensors",
        "refiner_model_name": "None",
        "refiner_switch": 0.5,
        "loras": [
            {
                "model_name": "sd_xl_offset_example-lora_1.0.safetensors",
                "weight": 0.1
            }
        ],
        "advanced_params": {
            "disable_preview": false,
            "adm_scaler_positive": 1.5,
            "adm_scaler_negative": 0.8,
            "adm_scaler_end": 0.3,
            "refiner_swap_method": "joint",
            "adaptive_cfg": 7,
            "sampler_name": "dpmpp_2m_sde_gpu",
            "scheduler_name": "karras",
            "overwrite_step": -1,
            "overwrite_switch": -1,
            "overwrite_width": -1,
            "overwrite_height": -1,
            "overwrite_vary_strength": -1,
            "overwrite_upscale_strength": -1,
            "mixing_image_prompt_and_vary_upscale": false,
            "mixing_image_prompt_and_inpaint": false,
            "debugging_cn_preprocessor": false,
            "skipping_cn_preprocessor": false,
            "controlnet_softness": 0.25,
            "canny_low_threshold": 64,
            "canny_high_threshold": 128,
            "freeu_enabled": false,
            "freeu_b1": 1.01,
            "freeu_b2": 1.02,
            "freeu_s1": 0.99,
            "freeu_s2": 0.95,
            "debugging_inpaint_preprocessor": false,
            "inpaint_disable_initial_latent": false,
            "inpaint_engine": "v1",
            "inpaint_strength": 1,
            "inpaint_respective_field": 1
        },
        "require_base64": false,
        "async_process": true
    };
};