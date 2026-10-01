/**
 * Performs an operation on large array of data in chunks.
 * @param data The data to be processed in chunks.
 * @param operation The operation to be performed on each chunk of data.
 * @param chunkSize The size of each chunk. Defaults to 5000.
 */
export async function performInChunks<T>(data: T[], operation: (chunk: T[]) => Promise<void>, chunkSize = 5000): Promise<void> {
	//

	//
	// Define an array to hold arrays of data (called chunks).

	const allChunksOfData: T[][] = [];

	//
	// Split the orignal data into chunks

	for (let i = 0; i < data.length; i += chunkSize) {
		allChunksOfData.push(data.slice(i, i + chunkSize));
	}

	//
	// Process each chunk of data

	for (const chunk of allChunksOfData) {
		await operation(chunk);
	}

	//
}
