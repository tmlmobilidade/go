/* * */

import { getPublicFeedbackReasonValuesByEntity, PublicFeedbackEntityTypeSchemaValues } from '@tmlmobilidade/types';

/* * */

export const PublicFeedbackReasons = PublicFeedbackEntityTypeSchemaValues.map(entityType => ({
	entity_type: entityType,
	values: getPublicFeedbackReasonValuesByEntity(entityType),
}));
