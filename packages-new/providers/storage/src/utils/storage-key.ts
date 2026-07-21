import { type Attachment } from '@tmlmobilidade/types';

import { getFileExtension } from './mime.js';

/* * */

/**
 * Generates a storage key for an attachment.
 *
 * @param {Pick<Attachment, '_id' | 'name' | 'resource_id' | 'scope'>} file - The attachment to generate a key for.
 * @returns {string} The generated storage key.
 */
export function storageKey(file: Pick<Attachment, '_id' | 'name' | 'resource_id' | 'scope'>): string {
	return `${file.scope}/${file.resource_id}/${file._id}.${getFileExtension(file.name)}`;
}

/**
 * Builds a storage key for an attachment.
 *
 * @param {string} scope - The scope of the attachment.
 * @param {string} resourceId - The resource ID of the attachment.
 * @param {string} id - The ID of the attachment.
 * @param {string} fileName - The name of the attachment.
 * @returns {string} The generated storage key.
 */
export function buildStorageKey(scope: string, resourceId: string, id: string, fileName: string): string {
	return `${scope}/${resourceId}/${id}.${getFileExtension(fileName)}`;
}

/**
 * Generates a temporary storage key for an attachment.
 *
 * @param {string} key - The key of the attachment.
 * @returns {string} The generated temporary storage key.
 */
export function tempStorageKey(key: string): string {
	return `.tmp/${key}.${Date.now()}`;
}
