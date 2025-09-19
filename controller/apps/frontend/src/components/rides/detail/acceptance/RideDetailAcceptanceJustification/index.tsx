'use client';

/* * */

import { AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { RideJustificationCause, RideJustificationCauseSchema } from '@tmlmobilidade/types';
import { Button, Combobox, Label, Section, Textarea } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

export function RidesDetailAcceptanceJustification() {
	//
	// A. Setup variables

	const acceptanceContext = useRidesDetailAcceptanceContext();
	const [message, setMessage] = useState(acceptanceContext.data.acceptance?.justification?.pto_message);
	const [cause, setCause] = useState<RideJustificationCause | undefined>(acceptanceContext.data.acceptance?.justification?.justification_cause);

	// const message = useMemo(() => acceptanceContext.data.acceptance?.justification?.pto_message, [acceptanceContext.data.acceptance?.justification?.pto_message]);
	// const cause = useMemo<RideJustificationCause | undefined>(() => acceptanceContext.data.acceptance?.justification?.justification_cause, [acceptanceContext.data.acceptance?.justification?.justification_cause]);

	//
	// B. Render components

	if (!acceptanceContext.data.acceptance) return null;

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>Justificação</Label>
			<AcceptanceStatusTag grade={acceptanceContext.data.acceptance.acceptance_status} />
			<Combobox
				data={RideJustificationCauseSchema.options}
				label="Motivo da justificação"
				onChange={v => setCause(v)}
				placeholder="Selecione o motivo da justificação"
				value={cause}
				fullWidth
				searchable
			/>
			<Textarea
				label="Mensagem de justificação"
				minRows={2}
				onChange={event => setMessage(event.target.value)}
				value={message}
				w="100%"
				autosize
			/>
			<Button
				label="Justificar"
				onClick={() => {
					acceptanceContext.actions.justify(message, cause);
				}}
			/>
		</Section>
	);
}
