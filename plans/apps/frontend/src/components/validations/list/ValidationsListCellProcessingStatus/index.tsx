/* * */

import { ProcessingStatus } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface ValidationsListCellProcessingStatusProps {
	value: ProcessingStatus
}

/* * */

export function ValidationsListCellProcessingStatus({ value }: ValidationsListCellProcessingStatusProps) {
	//

	if (value === ProcessingStatus.Complete) return <Tag label="Válido" variant="success" filled />;

	if (value === ProcessingStatus.Error) return <Tag label="Erro" variant="danger" />;

	if (value === ProcessingStatus.Processing) return <Tag label="Em Processamento" variant="primary" />;

	if (value === ProcessingStatus.Waiting) return <Tag label="Em Espera" variant="warning" />;

	return <Tag label="DESCONHECIDO" variant="danger" filled />;

	//
}
