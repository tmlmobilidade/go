/* * */

const TTS_API_URL = process.env.TTS_API_URL ?? 'http://localhost:8000';

export interface PiperTtsApiOptions {
	filename: string
	force?: boolean
	speed?: number
	string: string
}

export async function piperTtsApi({ filename, force = false, speed = 1.0, string }: PiperTtsApiOptions) {
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
