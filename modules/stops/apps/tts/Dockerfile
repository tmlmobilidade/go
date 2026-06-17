FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    espeak-ng \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

COPY modules/stops/apps/tts/daemon/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY modules/stops/apps/tts/daemon/ .
COPY modules/stops/apps/tts/voice_models/ voice_models/

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]