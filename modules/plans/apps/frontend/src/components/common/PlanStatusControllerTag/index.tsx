/* * */

import { type ProcessingStatus } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface PlanStatusControllerTagProps {
	status: ProcessingStatus
}

/* * */

export function PlanStatusControllerTag({ status }: PlanStatusControllerTagProps) {
	//

	if (status === 'waiting') {
		return <Tag label="Em Espera" variant="primary" />;
	}

	if (status === 'processing') {
		return <Tag label="Em Processamento" variant="primary" filled />;
	}

	if (status === 'complete') {
		return <Tag label="Finalizado" variant="success" />;
	}

	if (status === 'error') {
		return <Tag label="Erro" variant="danger" filled />;
	}

	return <Tag label="Unknown value" variant="muted" />;

	//
}
