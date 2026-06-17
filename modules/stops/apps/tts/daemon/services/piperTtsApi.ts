/* * */

import fs from 'fs';

/* * */

const TTS_API_URL = process.env.TTS_API_URL ?? 'http://localhost:8000';

export interface PiperTtsApiOptions {
	dirname: string
	filename: string
	force?: boolean
	speed?: number
	string: string
}

export async function piperTtsApi({ dirname, filename, force = false, speed = 1.0, string }: PiperTtsApiOptions) {
	//

	const pathname = `${dirname}/${filename}.mp3`;

	if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

	const response = await fetch(`${TTS_API_URL}/tts`, {
		body: JSON.stringify({ force, speed, stop_id: filename, text: string }),
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
	});

	const result = await response.json() as { error?: string, url?: string };

	if (!response.ok || result.error) throw new Error(result.error ?? `TTS API failed (${response.status})`);
	if (!result.url) throw new Error('TTS API returned no url');

	const audioResponse = await fetch(`${TTS_API_URL}${result.url}`);

	if (!audioResponse.ok) throw new Error(`Failed to download audio (${audioResponse.status})`);

	fs.writeFileSync(pathname, Buffer.from(await audioResponse.arrayBuffer()));

	//
}
