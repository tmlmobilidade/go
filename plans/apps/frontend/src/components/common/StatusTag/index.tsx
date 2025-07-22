/* * */

import { ProcessingStatus } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface StatusTagProps {
	status: ProcessingStatus
}

/* * */

export function StatusTag({ status }: StatusTagProps) {
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
		return <Tag label="Inválido" variant="danger" />;
	}

	return <Tag label="Missing feeder_status value" variant="muted" />;

	//
}
