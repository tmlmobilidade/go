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
		return <Tag label="Em Processamento" variant="primary" />;
	}

	if (status === ProcessingStatus.Complete) {
		return <Tag label="Processado" variant="success" />;
	}

	if (status === ProcessingStatus.Error) {
		return <Tag label="Erro" variant="danger" />;
	}

	return <Tag label="Missing feeder_status value" variant="muted" />;

	//
}
