/* * */

import { Readable } from 'node:stream';

/* * */

export interface IStorageProvider {
	// Copy a file from one path to another.
	copyFile(source: string, destination: string): Promise<void>

	// Delete a file from the storage.
	deleteFile(key: string): Promise<void>

	// Delete multiple files from the storage.
	deleteFiles(keys: string[]): Promise<void>

	// Check if a file exists in the storage.
	fileExists(key: string): Promise<boolean>

	// Get a file from the storage.
	getFileUrl(key: string): Promise<string>

	// List files in the storage.
	listFiles(prefix?: string): Promise<string[]>

	// Upload a file to the storage.
	uploadFile(key: string, body: Buffer | Readable | ReadableStream | string, mimeType?: string): Promise<void>
}
