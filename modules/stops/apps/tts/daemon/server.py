import os
import subprocess
import wave

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from piper import PiperVoice

MODEL_PATH = "voice_models/voice.onnx"
AUDIO_DIR = "audio"
TTS_LENGTH_SCALE = float(os.getenv("TTS_LENGTH_SCALE", "1.18"))
TTS_NOISE_SCALE = float(os.getenv("TTS_NOISE_SCALE", "0.45"))
TTS_NOISE_W = float(os.getenv("TTS_NOISE_W", "0.55"))
TTS_SPEED = float(os.getenv("TTS_SPEED", "0.92"))

os.makedirs(AUDIO_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

voice = PiperVoice.load(MODEL_PATH)


class TTSRequest(BaseModel):
    text: str
    stop_id: str
    speed: float = TTS_SPEED
    force: bool = False


def normalize_stop_id(stop_id: str) -> str:
    return stop_id.removesuffix('.mp3')


def mp3_path_for(stop_id: str) -> str:
    return f"{AUDIO_DIR}/{normalize_stop_id(stop_id)}.mp3"


@app.post("/generate")
def generate(req: TTSRequest):
    mp3_path = mp3_path_for(req.stop_id)

    if os.path.exists(mp3_path) and not req.force:
        return {"generated": False, "stop_id": normalize_stop_id(req.stop_id)}

    if req.force and os.path.exists(mp3_path):
        os.remove(mp3_path)

    wav_path = f"{AUDIO_DIR}/{normalize_stop_id(req.stop_id)}.wav"

    try:
        sample_rate = voice.config.sample_rate

        with wave.open(wav_path, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)

            voice.synthesize(
                req.text,
                wav_file,
                length_scale=TTS_LENGTH_SCALE,
                noise_scale=TTS_NOISE_SCALE,
                noise_w=TTS_NOISE_W,
            )

        if not os.path.exists(wav_path) or os.path.getsize(wav_path) < 1000:
            return {"error": "WAV generation failed"}

        speed = max(0.75, min(req.speed, 1.25))

        subprocess.run([
            "ffmpeg",
            "-y",
            "-i", wav_path,
            "-af",
            f"atempo={speed},"
            "highpass=f=120,"
            "lowpass=f=8500,"
            "afftdn=nf=-25,"
            "equalizer=f=250:width_type=h:width=220:g=-2,"
            "equalizer=f=3200:width_type=h:width=1800:g=2.5,"
            "equalizer=f=6000:width_type=h:width=2500:g=1.5,"
            "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=1.5,"
            "loudnorm=I=-16:TP=-1.5:LRA=11,"
            "alimiter=limit=0.95",
            "-acodec", "libmp3lame",
            "-b:a", "192k",
            mp3_path
        ], check=True)

        os.remove(wav_path)

        return {"generated": True, "stop_id": normalize_stop_id(req.stop_id)}

    except Exception as e:
        return {"error": str(e)}


@app.get("/audio/{stop_id}")
@app.get("/audio/{stop_id}.mp3")
def get_audio(stop_id: str):
    stop_id = normalize_stop_id(stop_id)
    mp3_path = mp3_path_for(stop_id)

    if not os.path.exists(mp3_path):
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(mp3_path, media_type="audio/mpeg", filename=f"{stop_id}.mp3")
