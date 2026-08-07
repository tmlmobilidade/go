/* * */

import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { getFileExtension, getMimeTypeFromFileExtension } from '@/utils/mime.js';
import { type Observability } from '@/utils/observability.js';
import { runOperation } from '@/utils/operation-runner.js';
import { ValidationError } from '@tmlmobilidade/go-clients-oci-storage';
import { type CreateAttachmentDto } from '@tmlmobilidade/types';

/* * */

export interface ValidateUploadResult {
	extension: string
	mimeType: string
}

export interface ValidateUploadInput {
	createAttachmentDto: Pick<CreateAttachmentDto, 'name' | 'size'>
	hooks?: OperationHooks<OperationContext, ValidateUploadResult>
	maxSizeBytes?: number
	observability?: Observability
}

/* * */

export async function validateUpload(input: ValidateUploadInput): Promise<ValidateUploadResult> {
	//

	const { createAttachmentDto, hooks, maxSizeBytes, observability } = input;
	const context: OperationContext = { operation: 'validateUpload' };

	return runOperation({
		context,
		execute: async () => {
			const extension = getFileExtension(createAttachmentDto.name);
			const mimeType = getMimeTypeFromFileExtension(createAttachmentDto.name);

			if (typeof createAttachmentDto.size === 'number' && createAttachmentDto.size < 0) {
				throw new ValidationError('File size cannot be negative', { context: { size: createAttachmentDto.size } });
			}

			if (maxSizeBytes !== undefined && createAttachmentDto.size > maxSizeBytes) {
				throw new ValidationError(`File size exceeds maximum of ${maxSizeBytes} bytes`, {
					context: { maxSizeBytes, size: createAttachmentDto.size },
				});
			}

			return { extension, mimeType };
		},
		hooks,
		observability,
	});
}
