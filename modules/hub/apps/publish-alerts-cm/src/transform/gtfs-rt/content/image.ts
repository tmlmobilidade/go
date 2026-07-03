/* * */

import { files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type GtfsRtTranslatedImage } from '@tmlmobilidade/types';

/* * */

export async function transformImage(alertData: Alert): Promise<GtfsRtTranslatedImage | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.file_id) return;

	//
	// Get the associated file data to prepare the image value

	const fileData = await files.findById(alertData.file_id);

	if (!fileData) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] File ${alertData.file_id} not found.` });
		return undefined;
	}

	if (!fileData.url) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] File ${alertData.file_id} URL is missing.` });
		return undefined;
	}

	if (!fileData.type) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] File ${alertData.file_id} type is missing.` });
		return undefined;
	}

	//
	// Return the mapped image

	return {
		localized_image: [{
			language: 'pt',
			media_type: fileData.type,
			url: fileData.url,
		}],
	};

	//
}
