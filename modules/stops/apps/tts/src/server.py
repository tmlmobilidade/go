import os
import subprocess
import wave

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

from piper import PiperVoice

MODEL_PATH = "models/voice.onnx"
AUDIO_DIR = "audio"

os.makedirs(AUDIO_DIR, exist_ok=True)

app = FastAPI()
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

voice = PiperVoice.load(MODEL_PATH)


class TTSRequest(BaseModel):
    text: str
    stop_id: str


@app.post("/tts")
def generate(req: TTSRequest):
    wav_path = f"{AUDIO_DIR}/{req.stop_id}.wav"
    mp3_path = f"{AUDIO_DIR}/{req.stop_id}.mp3"

    if os.path.exists(mp3_path):
        return {"url": f"/audio/{req.stop_id}.mp3"}

    try:
        # 🔥 CORRECT PIPELINE FOR YOUR PIPER VERSION
        with wave.open(wav_path, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(22050)

            voice.synthesize(req.text, wav_file)

        # validate output
        if not os.path.exists(wav_path) or os.path.getsize(wav_path) < 1000:
            return {"error": "WAV generation failed"}

        subprocess.run([
            "ffmpeg",
            "-y",
            "-i", wav_path,
            "-acodec", "libmp3lame",
            "-b:a", "128k",
            mp3_path
        ], check=True)

        os.remove(wav_path)

        return {"url": f"/audio/{req.stop_id}.mp3"}

    except Exception as e:
        return {"error": str(e)}