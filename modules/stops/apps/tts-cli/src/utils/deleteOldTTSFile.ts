import { files } from '@tmlmobilidade/interfaces';

export async function deleteOldTtsFile(fileId: string) {
	const existingFile = await files.findOne({ _id: fileId });
	if (!existingFile) return;

	await files.deleteOne({ _id: fileId });
}
