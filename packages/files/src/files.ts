/* * */

import { fetchZipFromUrl } from '@/utils/fetch-zip-from-url.js';
import { isBrowser } from '@/utils/is-browser.js';
import { normalizeFileContent } from '@/utils/normalize-file.content.js';
import { readZipFromFile } from '@/utils/read-zip-from-file.js';
import { mimeTypes } from '@tmlmobilidade/consts';
import JSZip from 'jszip';
import papaparse, { type ParseConfig } from 'papaparse';

/* * */

interface UpdateCsvFieldParams {
	column: string
	csvString: string
	rowIndex: number
	value: string
}

/* * */

export class Files {
	//

	/**
     * Converts a Blob to a File.
	 * @param blob The Blob object to convert.
	 * @param fileName The name of the resulting File.
	 * @returns The resulting File.
     */
	static blobToFile(blob: Blob, fileName: string): File {
		return new File([blob], fileName);
	}

	/**
	 * Returns the file extension from a file name.
	 * @param fileName The name of the file.
	 * @returns The file extension.
	 * @throws Error if the file has no extension or if the extension is not supported.
	 */
	static getFileExtension(fileName: string): string {
		// Extract the file extension from the file name.
		const extension = fileName.split('.').pop().toLowerCase();
		// Throw an error if the file has no extension
		// or if the extension is not supported.
		if (!extension) throw new Error('File has no extension');
		// Get the MIME type for the extension.
		const mimeType = mimeTypes[extension];
		// Throw an error if the extension is not supported.
		if (!mimeType) throw new Error(`Unsupported file extension: ${extension}`);
		// Return the file extension.
		return extension;
	}

	/**
	 * Gets the file extension from a MIME type.
	 * @param mimeType The MIME type to get the file extension for.
	 * @returns The file extension, or an empty string if not found.
	 */
	static getFileExtensionFromMimeType(mimeType: string): string {
		if (!mimeType) return '';
		const extension = Object.keys(mimeTypes).find(key => mimeTypes[key] === mimeType);
		if (!extension) return '';
		return extension;
	}

	/**
	 * Gets the MIME type from a file extension.
	 * @param fileName The name of the file to get the MIME type for.
	 * @returns The MIME type.
	 */
	static getMimeTypeFromFileExtension(fileName: string): string {
		const extension = Files.getFileExtension(fileName);
		return mimeTypes[extension];
	}

	/**
	 * Parses a CSV string into an array of objects using PapaParse.
	 * @param csvString The CSV string to parse
	 * @param options Parse configuration options
	 * @param options.header Whether to interpret first row as field names. Defaults to true.
	 * @param options.skipEmptyLines Whether to skip empty lines in the CSV. Defaults to true.
	 * @param options.rest Additional PapaParse configuration options
	 * @returns Promise resolving to array of parsed objects
	 * @throws Error if parsing fails with details of parsing errors
	 */
	static async parseCsv<T>(csvString: string, { header = true, skipEmptyLines = true, ...options }: ParseConfig<T>): Promise<T[]> {
		const parse = papaparse.parse<T>(csvString, { header, skipEmptyLines, ...options });

		if (parse.errors.length > 0) {
			throw new Error(`Failed to parse CSV: ${parse.errors.map(error => `${error.message} [${error.code}]`).join(', ')}`);
		}

		return parse.data;
	}

	/**
	 * Reads and extracts a single file from a ZIP archive.
	 * @param zipFilePath The zip file to read from, can be a File object (browser), string path (Node.js), or URL
	 * @param fileName The name of the file to extract from the ZIP
	 * @param encoding The encoding to use when reading the file. See JSZip documentation for supported formats.
	 * @returns A Promise resolving to the file contents in the specified encoding
	 * @throws Error if the file is not found in the ZIP
	 */
	static async readFileFromZip<T extends Parameters<JSZip.JSZipObject['async']>[0]>(zipFilePath: File | string | URL, fileName: string, encoding: T): Promise<ReturnType<JSZip.JSZipObject['async']> extends Promise<infer R> ? R : never> {
		const zip = await Files.unzip(zipFilePath);
		const file = zip.file(fileName);
		if (!file) throw new Error(`File ${fileName} not found in the zip archive.`);
		return await file.async(encoding);
	}

	/**
	 * Unzips a ZIP file from a File (browser), string path (Node.js), or URL.
	 * @param zipFilePath The path, URL, or File object representing the ZIP file to extract.
	 * @returns A Promise that resolves to a JSZip instance representing the unzipped contents.
	 */
	static async unzip(zipFilePath: File | string | URL): Promise<JSZip> {
		try {
			let data: ArrayBuffer | null = null;

			if (isBrowser && zipFilePath instanceof File) {
				data = await zipFilePath.arrayBuffer();
			}

			if (typeof zipFilePath === 'string' || zipFilePath instanceof URL) {
				const pathOrUrl = zipFilePath.toString();

				if (isBrowser || pathOrUrl.startsWith('http')) {
					data = await fetchZipFromUrl(pathOrUrl);
				} else {
					data = await readZipFromFile(pathOrUrl);
				}
			}

			if (!data || data.byteLength === 0) {
				throw new Error('ZIP file is empty');
			}

			const zip = await JSZip.loadAsync(data);

			if (Object.keys(zip.files).length === 0) {
				throw new Error('ZIP file contains no files');
			}

			return zip;
		} catch (error) {
			if (error instanceof Error && error.message.includes('Central Directory')) {
				throw new Error('Invalid or corrupted ZIP file');
			}
			throw error;
		}
	}

	/**
	 * Updates a CSV string with an object.
	 * @param csvString The CSV string to update
	 * @param column The column name to update
	 * @param row The row index to update
	 * @param value The value to update the column with
	 * @returns A Promise resolving to the updated CSV string
	 */
	static async updateCsvField<T>(params: UpdateCsvFieldParams[]): Promise<string> {
		let csv = params[0].csvString;

		for (const param of params) {
			const data = await this.parseCsv<T>(csv, { header: true });
			const updatedData = data.map((row, index) => (index === param.rowIndex ? { ...row, [param.column]: param.value } : row));
			csv = papaparse.unparse(updatedData, { header: true });
		}

		return csv;
	}

	/**
	 * Zips multiple files into a ZIP archive.
	 * @param files An object where keys are filenames and values are either File (browser) or Buffer/Uint8Array (Node.js).
	 * @returns A Promise resolving to a Uint8Array representing the ZIP file content.
	 */
	static async zip(files: Record<string, Buffer | File | Uint8Array>): Promise<Uint8Array> {
		try {
			const zip = new JSZip();

			await Promise.all(
				Object.entries(files).map(async ([filename, content]) => {
					const fileData = await normalizeFileContent(content);
					zip.file(filename, fileData);
				}),
			);

			const zipContent = await zip.generateAsync({ type: 'uint8array' });

			if (!zipContent || zipContent.length === 0) {
				throw new Error('Failed to generate ZIP: output is empty');
			}

			return zipContent;
		} catch (error) {
			throw new Error(`Failed to create ZIP archive: ${(error as Error).message}`);
		}
	}
}
