/* * */

import { type InfrastructureNodesV1Extraction } from '@tmlmobilidade/go-types-extractions';

import { buildExtractV1 } from '../../../build-extraction-v1.js';
import { infrastructureNodesV1ExtractionQuery } from './query.js';

/* * */

/** Builds the permitted stop filter and field projection for a v1 nodes extraction. */
export async function buildNodesExtractionQuery(extraction: InfrastructureNodesV1Extraction) {
	const prepared = await buildExtractV1(extraction);

	return { ...prepared, ...infrastructureNodesV1ExtractionQuery };
}
