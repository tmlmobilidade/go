/* * */

import { type OperationalDate, type UnixTimestamp } from '@go/types';
import { Dates } from '@go/dates';
import { parse as csvParser } from 'csv-parse';
import extract from 'extract-zip';
import fs from 'fs';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseCsvFile(filePath: string, rowParser: (rowData: any) => Promise<void>) {
	const parser = csvParser({ bom: true, columns: true, record_delimiter: ['\n', '\r', '\r\n'], skip_empty_lines: true, trim: true });
	const fileStream = fs.createReadStream(filePath);
	const stream = fileStream.pipe(parser);
	for await (const rowData of stream) {
		await rowParser(rowData);
	}
}

/* * */

export const unzipFile = async (zipFilePath, outputDir) => {
	await extract(zipFilePath, { dir: outputDir });
	setDirectoryPermissions(outputDir);
};

/* * */

export const setDirectoryPermissions = (dirPath, mode = 0o666) => {
	const files = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const file of files) {
		const filePath = `${dirPath}/${file.name}`;
		if (file.isDirectory()) {
			setDirectoryPermissions(filePath, mode);
		}
		else {
			fs.chmodSync(filePath, mode);
		}
	}
};

/* * */

export const convertGTFSTimeStringAndOperationalDateToUnixTimestamp = (timeString: string, operationalDate: OperationalDate): UnixTimestamp => {
	//

	// Return early if no time string is provided
	if (!timeString || !operationalDate) throw new Error(`✖︎ No time string or operational date provided. timeString: ${timeString}, operationalDate: ${operationalDate}`);

	// Check if the timestring is in the format HH:MM:SS
	if (!/^\d{2}:\d{2}:\d{2}$/.test(timeString)) throw new Error(`✖︎ Invalid time string format. timeString: ${timeString}`);

	// Extract the individual components of the time string (HH:MM:SS)
	const [hoursOperation, minutesOperation, secondsOperation] = timeString.split(':').map(Number);

	return Dates
		.fromOperationalDate(operationalDate, 'Europe/Lisbon')
		.set({ hour: hoursOperation, minute: minutesOperation, second: secondsOperation })
		.unix_timestamp;

	//
};
