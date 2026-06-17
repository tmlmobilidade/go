import os
import subprocess
import wave

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from piper import PiperVoice

MODEL_PATH = "models/voice.onnx"
AUDIO_DIR = "audio"

os.makedirs(AUDIO_DIR, exist_ok=True)

app = FastAPI()

voice = PiperVoice.load(MODEL_PATH)


class TTSRequest(BaseModel):
    text: str
    stop_id: str
    speed: float = 1.0
    force: bool = False


def mp3_path_for(stop_id: str) -> str:
    return f"{AUDIO_DIR}/{stop_id}.mp3"


@app.post("/generate")
def generate(req: TTSRequest):
    mp3_path = mp3_path_for(req.stop_id)

    if os.path.exists(mp3_path) and not req.force:
        return {"generated": False, "stop_id": req.stop_id}

    wav_path = f"{AUDIO_DIR}/{req.stop_id}.wav"

    try:
        sample_rate = voice.config.sample_rate

        with wave.open(wav_path, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)

            voice.synthesize(
                req.text,
                wav_file,
                length_scale=1.15,
                noise_scale=0.6,
                noise_w=0.7
            )

        if not os.path.exists(wav_path) or os.path.getsize(wav_path) < 1000:
            return {"error": "WAV generation failed"}

        speed = max(0.5, min(req.speed, 2.0))

        subprocess.run([
            "ffmpeg",
            "-y",
            "-i", wav_path,
            "-af",
            f"atempo={speed},"
            "highpass=f=80,"
            "lowpass=f=12000,"
            "equalizer=f=300:width_type=h:width=200:g=-3,"
            "equalizer=f=3000:width_type=h:width=1000:g=3,"
            "loudnorm",
            "-acodec", "libmp3lame",
            "-b:a", "192k",
            mp3_path
        ], check=True)

        os.remove(wav_path)

        return {"generated": True, "stop_id": req.stop_id}

    except Exception as e:
        return {"error": str(e)}


@app.get("/audio/{stop_id}")
def get_audio(stop_id: str):
    mp3_path = mp3_path_for(stop_id)

    if not os.path.exists(mp3_path):
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(mp3_path, media_type="audio/mpeg", filename=f"{stop_id}.mp3")
