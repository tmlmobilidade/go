/* * */

import { type AlertSchema } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface AlertTagPublishStatusProps {
	onClick?: () => void
	value: typeof AlertSchema.shape.publish_status._type
}

/* * */

export function AlertTagPublishStatus({ onClick, value }: AlertTagPublishStatusProps) {
	//

	if (!value) return;

	if (value === 'draft') return <Tag label="Rascunho" onClick={onClick} variant="muted" />;
	if (value === 'archived') return <Tag label="Arquivado" onClick={onClick} variant="primary" />;
	if (value === 'published') return <Tag label="Publicado" onClick={onClick} variant="primary" filled />;

	return <Tag label="UNKNOWN PUBLISH STATUS" onClick={onClick} variant="danger" />;

	//
}
