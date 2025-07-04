/* * */

import logger from '@helperkits/logger';
import { rabbitMQ } from '@tmlmobilidade/connectors';
import { GTFSValidator } from '@tmlmobilidade/gtfs-validator';
import { files, validations } from '@tmlmobilidade/interfaces';
import { ProcessingStatus } from '@tmlmobilidade/types';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

interface ValidationMessage {
	file_id: string
	validation_id: string
}

async function processValidation(message: ValidationMessage) {
	try {
		logger.info('Processing validation...');
		// 1. Update validation status to processing
		const validation = await validations.updateById(message.validation_id, {
			feeder_status: ProcessingStatus.Processing,
		});

		logger.info(`Validation set to processing: ${validation.acknowledged}`);

		// 2. Get the file from MongoDB
		const file = await files.findById(message.file_id);
		if (!file) {
			throw new Error(`File not found: ${message.file_id}`);
		}

		logger.info(`Getting file from MongoDB: ${file._id}`);

		// 3. Download and write file to temp directory for validation
		const fileBuffer = await fetch(file.url).then(res => res.arrayBuffer());
		const tempFilePath = join(tmpdir(), `gtfs_${message.file_id}.zip`);
		await writeFile(tempFilePath, Buffer.from(fileBuffer));

		logger.info(`File downloaded and written to temp directory: ${tempFilePath}`);

		// 4. Run GTFS validation
		logger.info(`Validating file: ${tempFilePath}`);
		const validationResult = await GTFSValidator(tempFilePath);

		logger.info(`File validated, updating document in MongoDB`);

		// 6. Update validation status based on results
		await validations.updateById(message.validation_id, {
			feeder_status: validationResult.total_errors > 0 ? ProcessingStatus.Error : ProcessingStatus.Complete,
			summary: validationResult,
		});

		logger.success('Validation Finished Successfully');
		logger.divider();
	}
	catch (error) {
		logger.error('Error processing validation:', error);

		// Update validation status to error
		await validations.updateById(message.validation_id, {
			feeder_status: ProcessingStatus.Error,
			summary: {
				messages: [
					{
						field: 'validation',
						file_name: 'validation.json',
						message: error instanceof Error ? error.message : 'Unknown error',
						rows: [],
						severity: 'error',
						validation_id: message.validation_id,
					},
				],
				total_errors: 1,
				total_warnings: 0,
			},
		});
	}
}

async function main() {
	// Subscribe to validation queue
	await rabbitMQ.subscribe('gtfs-validation', async (message) => {
		const validationMessage = JSON.parse(message.toString()) as ValidationMessage;

		logger.spacer(3);
		logger.title('🚀 Validation message received');
		logger.info(JSON.stringify(validationMessage));

		await processValidation(validationMessage);
	});

	logger.divider('🚀 GTFS Validator service started');
}

(async function startMainLoop() {
	while (true) {
		try {
			await main();
			break; // Exit loop if main resolves without error
		}
		catch (err) {
			console.error('Fatal error in main():', err);
			console.error('Restarting main() in 5 seconds...');
			await new Promise(res => setTimeout(res, 5000));
		}
	}
})();

/* * */
