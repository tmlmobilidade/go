/* * */

import { type ProcessingStatus } from '@tmlmobilidade/go-types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface ValidationStatusTagProps {
	status: ProcessingStatus
}

/* * */

export function ValidationStatusTag({ status }: ValidationStatusTagProps) {
	//

	if (status === 'waiting') {
		return <Tag label="Em Espera" variant="secondary" />;
	}

	if (status === 'processing') {
		return <Tag label="Em Análise" variant="primary" />;
	}

	if (status === 'complete') {
		return <Tag label="Válido" variant="success" filled />;
	}

	if (status === 'error') {
		return <Tag label="Inválido" variant="danger" filled />;
	}

	return <Tag label="Missing feeder_status value" variant="muted" />;

	//
}
