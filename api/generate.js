/**
 * Vercel Serverless Function — proxies video generation to RunPod
 * Keeps RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID out of the browser
 *
 * POST /api/generate
 * Body: { prompt, negative_prompt?, num_frames?, width?, height? }
 * Returns: { jobId } — poll /api/status/[jobId] for result
 */

const RUNPOD_API_KEY  = process.env.RUNPOD_API_KEY;
const ENDPOINT_ID     = process.env.RUNPOD_ENDPOINT_ID;
const BASE_URL        = `https://api.runpod.ai/v2/${ENDPOINT_ID}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, negative_prompt, num_frames, width, height } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const response = await fetch(`${BASE_URL}/run`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt,
          negative_prompt: negative_prompt || "blurry, low quality, distorted",
          num_frames:  num_frames  || 81,
          width:       width       || 832,
          height:      height      || 480,
          guidance_scale: 5.0,
          num_inference_steps: 40,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // Returns job ID immediately — frontend polls for result
    return res.status(200).json({ jobId: data.id, status: "queued" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
