/* * */

import { type InfrastructureStopsV1Extraction } from '@tmlmobilidade/go-types-extractions';

import { buildExtractV1 } from '../../../build-extraction-v1.js';
import { infrastructureStopsV1ExtractionQuery } from './query.js';

/* * */

/** Builds the permitted stop filter and field projection for a v1 stops extraction. */
export async function buildStopsExtractionQuery(extraction: InfrastructureStopsV1Extraction) {
	const { filter } = await buildExtractV1(extraction);

	return { filter, ...infrastructureStopsV1ExtractionQuery };
}
