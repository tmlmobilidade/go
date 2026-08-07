import { storageProvider } from '@tmlmobilidade/go-providers-storage';

export async function deleteOldTtsFile(fileId: string) {
	await storageProvider.delete(fileId);
}
