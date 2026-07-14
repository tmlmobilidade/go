/* * */

const TTS_API_URL = process.env.TTS_API_URL ?? 'http://localhost:8086';

type TtsResourceType = 'common' | 'patterns' | 'stops';

export interface PiperTtsApiOptions {
	filename: string
	force?: boolean
	resourceType?: TtsResourceType
	speed?: number
	string: string
}

interface GenerateResult { error?: string, generated?: boolean, id?: string, stop_id?: string }

function parseGenerateJson(buffer: Buffer): GenerateResult | null {
	try {
		return JSON.parse(buffer.toString('utf8')) as GenerateResult;
	} catch {
		return null;
	}
}

function isMp3Buffer(buffer: Buffer) {
	return buffer.length >= 100 && (
		buffer.subarray(0, 3).toString() === 'ID3'
		|| (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0)
	);
}

export async function piperTtsApi({ filename, force = false, resourceType = 'stops', speed = 0.92, string }: PiperTtsApiOptions) {
	//

	const response = await fetch(`${TTS_API_URL}/generate`, {
		body: JSON.stringify({ filename, force, resource_type: resourceType, speed, stop_id: filename, text: string }),
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
	});

	const result = await response.json() as GenerateResult;

	if (!response.ok || result.error) throw new Error(result.error ?? `TTS API failed (${response.status}) at ${TTS_API_URL}/generate`);
	if (!result.id && !result.stop_id) throw new Error('TTS API returned no id');

	//
}

export async function getPiperTtsAudio(filename: string): Promise<Buffer> {
	//

	const response = await fetch(`${TTS_API_URL}/audio/${filename}.mp3`);

	if (!response.ok) throw new Error(`TTS API failed to return audio (${response.status}) at ${TTS_API_URL}/audio/${filename}.mp3`);

	return Buffer.from(await response.arrayBuffer());

	//
}

export async function generatePiperTtsAudio({ filename, force = false, resourceType = 'stops', speed = 0.92, string }: PiperTtsApiOptions): Promise<Buffer> {
	//

	const response = await fetch(`${TTS_API_URL}/generate`, {
		body: JSON.stringify({ filename, force, resource_type: resourceType, return_audio: true, speed, stop_id: filename, text: string }),
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
	});

	const buffer = Buffer.from(await response.arrayBuffer());

	if (isMp3Buffer(buffer)) {
		return buffer;
	}

	const result = parseGenerateJson(buffer);

	if (result?.error) throw new Error(result.error);
	if (!response.ok) throw new Error(result?.error ?? `TTS API failed (${response.status}) at ${TTS_API_URL}/generate`);
	if (result?.id || result?.stop_id) return getPiperTtsAudio(filename);

	throw new Error('TTS API did not return audio');

	//
}
