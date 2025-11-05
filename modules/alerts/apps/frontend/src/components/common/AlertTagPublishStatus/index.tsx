/* * */

import { type AlertSchema } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface AlertTagPublishStatusProps {
	value: typeof AlertSchema.shape.publish_status.options[number]
}

/* * */

export function AlertTagPublishStatus({ value }: AlertTagPublishStatusProps) {
	//

	if (value === 'DRAFT') return <Tag label="Rascunho" variant="muted" />;
	if (value === 'ARCHIVED') return <Tag label="Arquivado" variant="primary" />;
	if (value === 'PUBLISHED') return <Tag label="Publicado" variant="primary" filled />;

	return <Tag label="UNKNOWN PUBLISH STATUS" variant="danger" />;

	//
}
