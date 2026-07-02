/* * */

const TTS_API_URL = process.env.TTS_API_URL ?? 'http://localhost:8086';

export interface PiperTtsApiOptions {
	filename: string
	force?: boolean
	speed?: number
	string: string
}

export async function piperTtsApi({ filename, force = false, speed = 0.92, string }: PiperTtsApiOptions) {
	//

	const response = await fetch(`${TTS_API_URL}/generate`, {
		body: JSON.stringify({ force, speed, stop_id: filename, text: string }),
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
	});

	const result = await response.json() as { error?: string, generated?: boolean, stop_id?: string };

	if (!response.ok || result.error) throw new Error(result.error ?? `TTS API failed (${response.status}) at ${TTS_API_URL}/generate`);
	if (!result.stop_id) throw new Error('TTS API returned no stop_id');

	//
}

export async function getPiperTtsAudio(filename: string): Promise<Buffer> {
	//

	const response = await fetch(`${TTS_API_URL}/audio/${filename}.mp3`);

	if (!response.ok) throw new Error(`TTS API failed to return audio (${response.status}) at ${TTS_API_URL}/audio/${filename}.mp3`);

	return Buffer.from(await response.arrayBuffer());

	//
}

export async function generatePiperTtsAudio({ filename, force = false, speed = 0.92, string }: PiperTtsApiOptions): Promise<Buffer> {
	//

	const response = await fetch(`${TTS_API_URL}/generate`, {
		body: JSON.stringify({ force, return_audio: true, speed, stop_id: filename, text: string }),
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
	});

	if (!response.ok) {
		const result = await response.json().catch(() => null) as null | { error?: string };
		throw new Error(result?.error ?? `TTS API failed (${response.status}) at ${TTS_API_URL}/generate`);
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('audio')) {
		const result = await response.json() as { error?: string };
		throw new Error(result.error ?? 'TTS API did not return audio');
	}

	return Buffer.from(await response.arrayBuffer());

	//
}
