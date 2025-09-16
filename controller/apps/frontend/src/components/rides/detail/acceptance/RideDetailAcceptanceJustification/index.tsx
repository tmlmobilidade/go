'use client';

/* * */

import { AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { RideJustificationCauseSchema } from '@tmlmobilidade/types';
import { Combobox, Label, Section, Textarea } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailAcceptanceJustification() {
	//
	// A. Setup variables

	const { data: { acceptance } } = useRidesDetailAcceptanceContext();

	//
	// B. Render components

	if (!acceptance) return null;

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>Justificação</Label>
			<AcceptanceStatusTag grade={acceptance.acceptance_status} />
			<Combobox
				data={RideJustificationCauseSchema.options}
				label="Motivo da justificação"
				placeholder="Selecione o motivo da justificação"
				fullWidth
				searchable
			/>
			<Textarea
				label="Mensagem de justificação"
				minRows={2}
				w="100%"
				autosize
			/>
		</Section>
	);
}
