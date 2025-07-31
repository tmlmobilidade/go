/* * */

import { ProcessingStatus } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface ValidationStatusTagProps {
	status: ProcessingStatus
}

/* * */

export function ValidationStatusTag({ status }: ValidationStatusTagProps) {
	//

	if (status === ProcessingStatus.Waiting) {
		return <Tag label="Em Espera" variant="secondary" />;
	}

	if (status === ProcessingStatus.Processing) {
		return <Tag label="Em Análise" variant="primary" />;
	}

	if (status === ProcessingStatus.Complete) {
		return <Tag label="Válido" variant="success" filled />;
	}

	if (status === ProcessingStatus.Error) {
		return <Tag label="Inválido" variant="danger" filled />;
	}

	return <Tag label="Missing feeder_status value" variant="muted" />;

	//
}
