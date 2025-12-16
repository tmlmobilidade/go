/* * */

import tts from '@carrismetropolitana/tts';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Sets the TTS name for a stop based on its regular name.
 * @param name The regular name of the stop.
 * @returns The TTS name of the stop.
 */
export function getStopTtsName(name: string): string {
	//

	if (!name) {
		Logger.error(`Stop does not have a name.`);
		return name;
	}

	//
	// Generate the TTS name

	const updatedTtsName = tts.makeText(name).trim();

	return updatedTtsName;

	//
}
