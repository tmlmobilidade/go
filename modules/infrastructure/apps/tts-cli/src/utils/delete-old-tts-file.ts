/* * */

import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Deletes an old TTS file from storage.
 * @param fileId The ID of the file to delete.
 */
export async function deleteOldTtsFile(fileId: string) {
	await storageProvider.delete(fileId);
}
