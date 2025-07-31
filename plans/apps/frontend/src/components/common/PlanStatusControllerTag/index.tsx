/* * */

import { ProcessingStatus } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface PlanStatusControllerTagProps {
	status: ProcessingStatus
}

/* * */

export function PlanStatusControllerTag({ status }: PlanStatusControllerTagProps) {
	//

	if (status === ProcessingStatus.Waiting) {
		return <Tag label="Em Espera" variant="primary" />;
	}

	if (status === ProcessingStatus.Processing) {
		return <Tag label="Em Processamento" variant="primary" filled />;
	}

	if (status === ProcessingStatus.Complete) {
		return <Tag label="Finalizado" variant="success" />;
	}

	if (status === ProcessingStatus.Error) {
		return <Tag label="Erro" variant="danger" filled />;
	}

	return <Tag label="Unknown value" variant="muted" />;

	//
}
