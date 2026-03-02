declare const window: typeof globalThis;
export const isBrowser = typeof window?.document !== 'undefined';

/**
 * Fetches a ZIP file from a URL and returns it as an ArrayBuffer.
 * @param url The URL of the ZIP file to fetch
 * @returns A Promise that resolves to an ArrayBuffer containing the ZIP file data
 * @throws {Error} If the HTTP request fails or returns a non-200 status code
 */
export async function fetchZipFromUrl(url: string): Promise<ArrayBuffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ZIP file: HTTP ${response.status} - ${response.statusText}`);
	}
	return await response.arrayBuffer();
}

/**
 * Reads a ZIP file from the local filesystem and returns it as an ArrayBuffer.
 * @param path The file system path to the ZIP file
 * @returns A Promise that resolves to an ArrayBuffer containing the ZIP file data
 * @throws {Error} If there is an error reading the file
 */
export async function readZipFromFile(path: string): Promise<ArrayBuffer> {
	if (isBrowser) {
		throw new Error('readZipFromFile is not supported in the browser');
	}

	// Only require fs/promises in Node.js
	const { readFile } = await (Function('return import("fs/promises")')());

	try {
		const buffer = await readFile(path);
		return buffer.buffer as ArrayBuffer;
	} catch (err) {
		throw new Error(`Failed to read ZIP file: ${(err as Error).message}`);
	}
}

/**
 * Converts the input file data into an ArrayBuffer or Uint8Array suitable for JSZip.
 * @param content A File (browser) or Buffer/Uint8Array (Node.js)
 */
export async function normalizeFileContent(
	content: Buffer | File | Uint8Array,
): Promise<ArrayBuffer | Uint8Array> {
	if (isBrowser && content instanceof File) {
		return await content.arrayBuffer();
	}

	if (content instanceof Buffer || content instanceof Uint8Array) {
		return content;
	}

	throw new TypeError('Unsupported file content type for zipping');
}
