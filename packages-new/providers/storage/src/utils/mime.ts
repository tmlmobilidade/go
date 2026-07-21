/* * */

import { ValidationError } from '@/types/storage-error.js';
import { mimeTypes } from '@tmlmobilidade/consts';

/* * */

/**
 * Extracts the file extension from a file name and validates it against supported MIME types.
 *
 * @param {string} fileName - The name of the file.
 * @returns {string} The lowercase file extension.
 * @throws {ValidationError} If the file does not have an extension or the extension is unsupported.
 */
export function getFileExtension(fileName: string): string {
	const extension = fileName.split('.').pop()?.toLowerCase();
	if (!extension) throw new ValidationError('File has no extension', { context: { fileName } });
	if (!(extension in mimeTypes)) {
		throw new ValidationError(`Unsupported file extension: ${extension}`, { context: { extension, fileName } });
	}
	return extension;
}

/**
 * Retrieves the MIME type associated with a file extension found in the file name.
 *
 * @param {string} fileName - The name of the file.
 * @returns {string} The MIME type corresponding to the file extension.
 * @throws {ValidationError} If the extension is missing or unsupported.
 */
export function getMimeTypeFromFileExtension(fileName: string): string {
	return mimeTypes[getFileExtension(fileName) as keyof typeof mimeTypes];
}

/**
 * Finds the file extension corresponding to the provided MIME type.
 *
 * @param {string} mimeType - The MIME type to look up.
 * @returns {string} The file extension matching the MIME type, or an empty string if not found.
 */
export function getFileExtensionFromMimeType(mimeType: string): string {
	if (!mimeType) return '';
	return Object.keys(mimeTypes).find(key => mimeTypes[key as keyof typeof mimeTypes] === mimeType) ?? '';
}
