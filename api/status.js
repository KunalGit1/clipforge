/**
 * Vercel Serverless Function — polls RunPod job status
 *
 * GET /api/status?jobId=xxx
 * Returns: { status, video_b64? }
 *   status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED"
 */

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const ENDPOINT_ID    = process.env.RUNPOD_ENDPOINT_ID;
const BASE_URL       = `https://api.runpod.ai/v2/${ENDPOINT_ID}`;

export default async function handler(req, res) {
  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  try {
    const response = await fetch(`${BASE_URL}/status/${jobId}`, {
      headers: { "Authorization": `Bearer ${RUNPOD_API_KEY}` },
    });

    const data = await response.json();

    // data.status: IN_QUEUE | IN_PROGRESS | COMPLETED | FAILED
    if (data.status === "COMPLETED") {
      return res.status(200).json({
        status: "COMPLETED",
        video_b64: data.output?.video_b64,
      });
    }

    return res.status(200).json({ status: data.status });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
