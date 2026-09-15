/* * */

import { extractInfrastructureStopsV1 } from '@tmlmobilidade/go-extractions-infrastructure-stops';
import { extractOfferGtfsV29 } from '@tmlmobilidade/go-extractions-offer-gtfs';
import { operationPostersV1Extraction } from '@tmlmobilidade/go-extractions-operation-posters';
import { operationRidesV1Extraction } from '@tmlmobilidade/go-extractions-operation-rides';
import { type Extraction, type ExtractionTaskContext, type ExtractionTaskResult } from '@tmlmobilidade/go-types-extractions';

/* * */

export const VERSIONS_MAP: Record<Extraction['version'], (context: ExtractionTaskContext, extraction: Extraction) => Promise<ExtractionTaskResult>> = {
	'infrastructure-stops-v1': extractInfrastructureStopsV1,
	'offer-gtfs-v29': extractOfferGtfsV29,
	'operation-posters-v1': operationPostersV1Extraction,
	'operation-rides-v1': operationRidesV1Extraction,
};
