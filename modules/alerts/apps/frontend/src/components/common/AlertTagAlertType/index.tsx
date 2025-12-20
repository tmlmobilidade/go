/* * */

import { type AlertSchema } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface AlertTagAlertTypeProps {
	onClick?: () => void
	value: typeof AlertSchema.shape.type._type
}

/* * */

export function AlertTagAlertType({ onClick, value }: AlertTagAlertTypeProps) {
	//

	if (!value) return;

	if (value === 'scheduled') return <Tag label="Alerta Planeado" onClick={onClick} variant="muted" />;
	if (value === 'realtime') return <Tag label="Alerta Tempo Real" onClick={onClick} variant="primary" />;

	return <Tag label="UNKNOWN ALERT TYPE" onClick={onClick} variant="danger" />;

	//
}
