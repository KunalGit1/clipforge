"""
ClipForge — RunPod Serverless Handler
Runs Wan2.1 1.3B on RTX 3090 and returns base64-encoded MP4

Model is loaded ONCE when worker starts (warm), stays in memory.
Network Volume at /runpod-volume/models/ persists across restarts.
"""

import runpod
import torch
import base64
import os
import tempfile

MODEL_PATH = "/runpod-volume/models/wan2.1-t2v"
pipe = None


def load_model():
    global pipe
    if pipe is not None:
        return pipe

    print("Loading Wan2.1 model...")
    from diffusers import WanPipeline
    from diffusers.utils import export_to_video

    pipe = WanPipeline.from_pretrained(
        MODEL_PATH,
        torch_dtype=torch.bfloat16,
    ).to("cuda")

    print("Model loaded.")
    return pipe


def handler(job):
    """
    Input:
      prompt        (str)  — scene description
      negative_prompt (str) — optional
      num_frames    (int)  — default 81 (~5s at 16fps)
      width         (int)  — default 832
      height        (int)  — default 480
      guidance_scale (float) — default 5.0
      num_inference_steps (int) — default 40

    Output:
      video_b64     (str)  — base64-encoded MP4
      status        (str)
    """
    inputs = job.get("input", {})

    prompt             = inputs.get("prompt", "")
    negative_prompt    = inputs.get("negative_prompt", "blurry, low quality, distorted")
    num_frames         = inputs.get("num_frames", 81)
    width              = inputs.get("width", 832)
    height             = inputs.get("height", 480)
    guidance_scale     = inputs.get("guidance_scale", 5.0)
    num_inference_steps = inputs.get("num_inference_steps", 40)

    if not prompt:
        return {"status": "error", "error": "prompt is required"}

    try:
        from diffusers.utils import export_to_video

        model = load_model()

        output = model(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_frames=num_frames,
            width=width,
            height=height,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
        )

        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            export_to_video(output.frames[0], f.name, fps=16)
            with open(f.name, "rb") as vid:
                video_b64 = base64.b64encode(vid.read()).decode("utf-8")
            os.unlink(f.name)

        return {
            "status": "success",
            "video_b64": video_b64,
            "prompt": prompt,
            "frames": num_frames,
        }

    except Exception as e:
        return {"status": "error", "error": str(e)}


runpod.serverless.start({"handler": handler})
