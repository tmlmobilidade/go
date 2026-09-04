/* * */

import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type GtfsRtTranslatedImage } from '@tmlmobilidade/go-types-gtfs-rt';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function transformImage(alertData: Alert): Promise<GtfsRtTranslatedImage | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.file_id) return;

	//
	// Get the associated file data to prepare the image value

	const fileData = await storageProvider.findById(alertData.file_id);

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
