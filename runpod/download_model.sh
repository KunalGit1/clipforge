#!/bin/bash
# Run this ONCE on a cheap pod to download the model to Network Volume
# Then stop the pod — model persists on the volume forever

pip install huggingface_hub

# Download Wan2.1 T2V 1.3B (~3GB)
huggingface-cli download \
  Wan-AI/Wan2.1-T2V-1.3B-Diffusers \
  --local-dir /runpod-volume/models/wan2.1-t2v

echo "Done. Model saved to /runpod-volume/models/wan2.1-t2v"
echo "You can now stop this pod and deploy serverless."
ls -lh /runpod-volume/models/wan2.1-t2v
