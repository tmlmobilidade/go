/* * */

import { getPublicFeedbackReasonValuesByEntity, PublicFeedbackEntityTypeSchemaValues } from '@tmlmobilidade/go-types-performance';

/* * */

export const PublicFeedbackReasons = PublicFeedbackEntityTypeSchemaValues.map(entityType => ({
	entity_type: entityType,
	values: getPublicFeedbackReasonValuesByEntity(entityType),
}));
