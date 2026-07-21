/* * */

import { type Attachment } from '@tmlmobilidade/types';

import { getFileExtension } from './mime.js';

/**
 * Generates a storage key for an attachment.
 * @param {Pick<Attachment, '_id' | 'name' | 'resource_id' | 'scope'>} file - The attachment to generate a key for.
 * @returns The generated storage key.
 */
export function storageKey(file: Pick<Attachment, '_id' | 'name' | 'resource_id' | 'scope'>): string {
	return `${file.scope}/${file.resource_id}/${file._id}.${getFileExtension(file.name)}`;
}

/**
 * Builds a storage key for an attachment.
 * @param scopeThe scope of the attachment.
 * @param resourceIdThe resource ID of the attachment.
 * @param idThe ID of the attachment.
 * @param fileNameThe name of the attachment.
 * @returns The generated storage key.
 */
export function buildStorageKey(scope: string, resourceId: string, id: string, fileName: string): string {
	return `${scope}/${resourceId}/${id}.${getFileExtension(fileName)}`;
}

/**
 * Generates a temporary storage key for an attachment.
 * @param key The key of the attachment.
 * @returns The generated temporary storage key.
 */
export function tempStorageKey(key: string): string {
	return `.tmp/${key}.${Date.now()}`;
}
