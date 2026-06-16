/* * */

import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';

/* * */

let googleCloudTTSClient;

export async function googleCloudTtsApi({ dirname, filename, replaceIfExists = false, string }) {
	//

	// Export settings
	const pathname = `${dirname}/${filename}.mp3`;

	// Create the output directory if it does not exist
	if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

	// If flag is set and file exists, skip this stop
	if (!replaceIfExists && fs.existsSync(pathname)) return;

	// Create a new Google TTS client
	if (!googleCloudTTSClient) googleCloudTTSClient = new textToSpeech.TextToSpeechClient();

	// This uses the paid Google Cloud TTS API, however with a generous free-tier
	const [response] = await googleCloudTTSClient.synthesizeSpeech({
		audioConfig: { audioEncoding: 'MP3', effectsProfileId: ['large-automotive-class-device'], pitch: 2, speakingRate: 0.95, volumeGainDb: 3 },
		input: { text: string },
		voice: { languageCode: 'pt-PT', name: 'pt-PT-Standard-B' }, // Can go from 'pt-PT-Standard-A' to 'pt-PT-Standard-D'
	});

	// Write the binary audio content to a local file
	fs.writeFileSync(pathname, response.audioContent, { encoding: 'binary' });

	//
};
