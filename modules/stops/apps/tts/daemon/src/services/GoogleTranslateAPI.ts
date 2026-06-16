/* * */

import axios from 'axios';
import fs from 'fs';
import googleTranslateApi from 'google-tts-api';

/* * */

module.exports = async (stopData, skipIfExists = true) => {
	//

	// Export settings
	const dirname = 'outputs/google-translate-api';
	const filename = `${stopData.stop_id}.mp3`;
	const pathname = `${dirname}/${filename}`;

	// Create the output directory if it does not exist
	if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

	// If flag is set and file exists, skip this stop
	if (skipIfExists && fs.existsSync(pathname)) return;

	// Build the TTS audio URL
	const urlFreeUsingGoogleTranslate = googleTranslateApi.getAudioUrl(stopData.tts_stop_name, { lang: 'pt', slow: false });

	// Fetch the audio file
	const response = await axios({ method: 'get', responseType: 'stream', url: urlFreeUsingGoogleTranslate });

	// Pipe the data into
	response.data.pipe(fs.createWriteStream(pathname));

	//
	await new Promise((resolve, reject) => {
		response.data.on('end', resolve);
		response.data.on('error', reject);
	});

	//
};
