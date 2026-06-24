import { ttsApiUrl } from '@/settings/urls.settings';

/* * */

export async function regenerateStopTts(stopId: string, text: string) {
	//

	const response = await fetch(`${ttsApiUrl}/generate`, {
		body: JSON.stringify({ force: true, stop_id: String(stopId), text }),
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
	});

	const result = await response.json() as { error?: string, stop_id?: string };

	if (!response.ok || result.error) throw new Error(result.error ?? 'TTS generation failed');

	//
}
