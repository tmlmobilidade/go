/* * */

import { type ParsedTransactionEntityV2, type UnparsedTransactionEntityV2 } from '@tmlmobilidade/types';

/* * */

export function parseApexTransactionEntityV20(doc: UnparsedTransactionEntityV2): null | ParsedTransactionEntityV2 {
	try {
		//

		//
		// Validate the document structure and content

		if (!doc.decodeValue) throw new Error('Missing decodeValue in transaction.');

		const decodeValue = JSON.parse(doc.decodeValue);

		return {
			...doc,
			decodeValue: decodeValue,
		};

		//
	} catch (error) {
		console.error(`Error parsing APEX transaction entity with ID "${doc._id}":`, error);
		return null;
	}
}
