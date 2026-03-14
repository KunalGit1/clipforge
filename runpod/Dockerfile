# ClipForge RunPod Worker
# Base: RunPod PyTorch (CUDA 12.4, Python 3.11)
FROM runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04

WORKDIR /workspace

# Install dependencies
RUN pip install --no-cache-dir \
    runpod==1.7.9 \
    diffusers \
    transformers \
    accelerate \
    imageio[ffmpeg] \
    huggingface_hub

# Copy handler
COPY handler.py .

# Model lives on Network Volume (/runpod-volume/models/)
# NOT baked into image — keeps image small (~3GB not 35GB)
# Download script runs separately (see download_model.sh)

CMD ["python", "-u", "handler.py"]
