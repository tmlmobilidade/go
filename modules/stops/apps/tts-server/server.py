from contextlib import contextmanager
import os
import subprocess
import wave
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel


@contextmanager
def suppress_native_stderr():
    stderr_fd = os.dup(2)

    try:
        with open(os.devnull, "w") as devnull:
            os.dup2(devnull.fileno(), 2)
            yield
    finally:
        os.dup2(stderr_fd, 2)
        os.close(stderr_fd)


os.environ.setdefault("ORT_LOG_SEVERITY_LEVEL", "3")

with suppress_native_stderr():
    from piper import PiperVoice

MODEL_PATH = "voice_models/voice.onnx"
AUDIO_DIR = "audio"
TTS_RESOURCE_LABELS = {
    "common": "Common",
    "patterns": "Pattern",
    "stops": "Stop",
}
TTS_LENGTH_SCALE = float(os.getenv("TTS_LENGTH_SCALE", "1.18"))
TTS_NOISE_SCALE = float(os.getenv("TTS_NOISE_SCALE", "0.45"))
TTS_NOISE_W = float(os.getenv("TTS_NOISE_W", "0.55"))
TTS_SPEED = float(os.getenv("TTS_SPEED", "0.82"))

os.makedirs(AUDIO_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with suppress_native_stderr():
    voice = PiperVoice.load(MODEL_PATH)


print("Your text now has a voice, because apparently that's what I'm here for.", flush=True)


class TTSRequest(BaseModel):
    text: str
    filename: Optional[str] = None
    stop_id: Optional[str] = None
    resource_type: Literal["common", "patterns", "stops"] = "stops"
    speed: float = TTS_SPEED
    force: bool = False
    return_audio: bool = False


def normalize_audio_id(audio_id: str) -> str:
    safe_id = os.path.basename(audio_id)  
    return safe_id.removesuffix('.mp3')  


def get_audio_id(req: TTSRequest) -> str:
    audio_id = req.filename or req.stop_id

    if not audio_id:
        raise HTTPException(status_code=400, detail="filename is required")

    return normalize_audio_id(audio_id)


def mp3_path_for(audio_id: str) -> str:
    return f"{AUDIO_DIR}/{normalize_audio_id(audio_id)}.mp3"


def response_for(generated: bool, audio_id: str, resource_type: str):
    return {
        "generated": generated,
        "id": normalize_audio_id(audio_id),
        "resource_type": resource_type,
        "stop_id": normalize_audio_id(audio_id),
    }


@app.post("/generate")
def generate(req: TTSRequest):
    audio_id = get_audio_id(req)
    mp3_path = mp3_path_for(audio_id)

    if os.path.exists(mp3_path) and not req.force:
        return response_for(False, audio_id, req.resource_type)

    if req.force and os.path.exists(mp3_path):
        os.remove(mp3_path)

    wav_path = f"{AUDIO_DIR}/{audio_id}.wav"
    resource_label = TTS_RESOURCE_LABELS[req.resource_type]

    try:
        print(f"Generating for {resource_label} {audio_id}", flush=True)

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
            "-hide_banner",
            "-loglevel", "error",
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
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        os.remove(wav_path)

        if req.return_audio:
            return FileResponse(
                mp3_path,
                media_type="audio/mpeg",
                filename=f"{audio_id}.mp3",
            )

        return response_for(True, audio_id, req.resource_type)

    except Exception as e:
        return {"error": str(e)}


@app.get("/audio/{audio_id}")
@app.get("/audio/{audio_id}.mp3")
def get_audio(audio_id: str):
    audio_id = normalize_audio_id(audio_id)
    mp3_path = mp3_path_for(audio_id)

    if not os.path.exists(mp3_path):
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(mp3_path, media_type="audio/mpeg", filename=f"{audio_id}.mp3")
