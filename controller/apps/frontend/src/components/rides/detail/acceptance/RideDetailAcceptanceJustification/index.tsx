'use client';

import { AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { Permissions } from '@tmlmobilidade/lib';
import { RideJustificationCause, RideJustificationCauseSchema } from '@tmlmobilidade/types';
import { Button, Combobox, HasPermission, Label, Section, Text, Textarea } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

function JustificationReadOnly({ cause, message }: { cause?: string, message?: string }) {
	return (
		<>
			<Label size="lg" caps>Justificação</Label>
			<Section gap="xs" padding="none">
				<Label>Motivo da justificação</Label>
				<Text>{cause || '—'}</Text>
			</Section>
			<Section gap="xs" padding="none">
				<Label>Mensagem de justificação</Label>
				<Text>{message || '—'}</Text>
			</Section>
		</>
	);
}

function JustificationEditable({ cause, message, onSubmit, setCause, setMessage }: { cause?: RideJustificationCause, message: string, onSubmit: () => void, setCause: (v: RideJustificationCause) => void, setMessage: (v: string) => void }) {
	return (
		<>
			<Combobox
				data={RideJustificationCauseSchema.options}
				label="Motivo da justificação"
				onChange={setCause}
				placeholder="Selecione o motivo da justificação"
				value={cause}
				fullWidth
				searchable
			/>
			<Textarea
				label="Mensagem de justificação"
				minRows={2}
				onChange={e => setMessage(e.target.value)}
				value={message}
				w="100%"
				autosize
			/>
			<Button label="Justificar" onClick={onSubmit} fullWidth />
		</>
	);
}

export function RidesDetailAcceptanceJustification() {
	const { actions, data } = useRidesDetailAcceptanceContext();
	const { acceptance } = data;

	if (!acceptance) return null;

	const { acceptance_status, justification } = acceptance;

	const [message, setMessage] = useState(justification?.pto_message ?? '');
	const [cause, setCause] = useState<RideJustificationCause | undefined>(justification?.justification_cause);

	const handleSubmit = () => actions.justify(message, cause);

	const fallback = useMemo(() => <JustificationReadOnly cause={cause} message={message} />, [cause, message]);

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>Justificação</Label>
			<AcceptanceStatusTag grade={acceptance_status} />
			<HasPermission
				action={Permissions.rides.actions.justification_justify}
				fallback={fallback}
				scope={Permissions.rides.scope}
			>
				<JustificationEditable
					cause={cause}
					message={message}
					onSubmit={handleSubmit}
					setCause={setCause}
					setMessage={setMessage}
				/>
			</HasPermission>
		</Section>
	);
}
