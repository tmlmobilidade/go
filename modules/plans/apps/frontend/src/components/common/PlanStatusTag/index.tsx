/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type ProcessingStatus, type UnixTimestamp } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface PlanStatusTagProps {
	status: ProcessingStatus
	timestamp?: UnixTimestamp
}

/* * */

export function PlanStatusTag({ status, timestamp }: PlanStatusTagProps) {
	//

	//
	// A. Transform data

	const parsedTimestamp = useMemo(() => {
		if (!timestamp) return;
		return Dates
			.fromUnixTimestamp(timestamp)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat('\'Atualizado a\' yyyy-LL-dd \'às\' HH:mm');
	}, [timestamp]);

	//
	// B. Render components

	if (status === 'waiting') {
		return <Tag label="Em Espera" tooltip={parsedTimestamp} variant="primary" />;
	}

	if (status === 'processing') {
		return <Tag label="Em Processamento" tooltip={parsedTimestamp} variant="primary" filled />;
	}

	if (status === 'complete') {
		return <Tag label="Finalizado" tooltip={parsedTimestamp} variant="success" />;
	}

	if (status === 'error') {
		return <Tag label="Erro" tooltip={parsedTimestamp} variant="danger" filled />;
	}

	return <Tag label="Unknown" tooltip={parsedTimestamp} variant="muted" />;

	//
}
