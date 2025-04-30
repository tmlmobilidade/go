/* * */

import { rabbitMQ } from '@tmlmobilidade/connectors';
import { GTFSValidator } from '@tmlmobilidade/gtfs-validator';
import { files, validations } from '@tmlmobilidade/interfaces';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

interface ValidationMessage {
	file_id: string
	validation_id: string
}

async function processValidation(message: ValidationMessage) {
	try {
		// 1. Update validation status to processing
		await validations.updateById(message.validation_id, {
			feeder_status: 'processing',
		});

		// 2. Get the file from MongoDB
		const fileUrl = await files.getFileUrl({ file_id: message.file_id });
		if (!fileUrl) {
			throw new Error(`File not found: ${message.file_id}`);
		}

		// 3. Download and write file to temp directory for validation
		const fileBuffer = await fetch(fileUrl).then(res => res.arrayBuffer());
		const tempFilePath = join(tmpdir(), `gtfs_${message.file_id}.zip`);
		await writeFile(tempFilePath, Buffer.from(fileBuffer));

		console.log('🚀 Validating file:', tempFilePath);

		// 4. Run GTFS validation
		const validationResult = await GTFSValidator(tempFilePath);

		// 5. Update validation status based on results
		await validations.updateById(message.validation_id, {
			feeder_status: validationResult.total_errors > 0 ? 'error' : 'success',
			summary: validationResult,
		});

		// 6. Send validation results to RabbitMQ
		await rabbitMQ.publish('gtfs-validation-results', JSON.stringify(validationResult));
		console.log('🚀 Validation Finished Successfully');
	}
	catch (error) {
		console.error('Error processing validation:', error);

		// Update validation status to error
		await validations.updateById(message.validation_id, {
			feeder_status: 'error',
		});
	}
}

async function main() {
	// Subscribe to validation queue
	await rabbitMQ.subscribe('gtfs-validation', async (message) => {
		const validationMessage = JSON.parse(message.toString()) as ValidationMessage;
		console.log(validationMessage);
		await processValidation(validationMessage);
	});

	console.log('🚀 GTFS Validator service started');
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
/* * */
