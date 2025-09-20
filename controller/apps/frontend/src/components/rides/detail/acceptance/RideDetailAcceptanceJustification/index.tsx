'use client';

import { AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { RideAcceptance, RideAcceptanceStatusSchema, RideJustificationCause, RideJustificationCauseSchema } from '@tmlmobilidade/types';
import { Button, Combobox, HasPermission, IconButton, Label, Section, Text, Textarea, useToast } from '@tmlmobilidade/ui';
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

function AcceptanceStatus({ grade }: { grade: RideAcceptance['acceptance_status'] }) {
	//
	// A. Setup variables
	const { actions } = useRidesDetailAcceptanceContext();
	const [isEditing, setIsEditing] = useState(false);
	const [status, setStatus] = useState<RideAcceptance['acceptance_status']>(grade);

	//
	// C. Handle actions

	async function handleSubmit() {
		try {
			await actions.changeStatus(status);
			setIsEditing(false);
		}
		catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao alterar estado da aceitação' });
		}
	}

	//
	// B. Render components

	return (
		<>
			{isEditing ? (
				<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
					<Combobox
						data={RideAcceptanceStatusSchema.options}
						label="Status da justificação"
						onChange={value => setStatus(value as RideAcceptance['acceptance_status'])}
						value={status}
						fullWidth
					/>
					<IconButton icon={<IconCheck />} onClick={handleSubmit} variant="subtle" />
				</Section>
			) : (
				<Section alignItems="center" flexDirection="row" gap="xs"	padding="none">
					<AcceptanceStatusTag grade={grade} />
					<HasPermission
						action={Permissions.rides.actions.justification_change_status}
						scope={Permissions.rides.scope}
					>
						<IconButton icon={<IconEdit />} onClick={() => setIsEditing(true)} variant="subtle" />
					</HasPermission>
				</Section>
			)}
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
			<AcceptanceStatus grade={acceptance_status} />
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
