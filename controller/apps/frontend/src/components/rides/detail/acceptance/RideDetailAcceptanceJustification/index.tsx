'use client';

import { AcceptanceStatusProps, AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { CauseIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { GtfsCause, gtfsCauseSchema, RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/types';
import { Button, Combobox, HasPermission, IconButton, Label, Section, Text, Textarea, useToast } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

function JustificationReadOnly({ cause, message }: { cause?: string, message?: string }) {
	return (
		<>
			<Label size="lg" caps>Justificação</Label>
			<Section gap="xs" padding="none">
				<Label>Motivo da justificação</Label>
				<Text>{cause ? Translations.CAUSE[cause as GtfsCause] : '—'}</Text>
			</Section>
			<Section gap="xs" padding="none">
				<Label>Mensagem de justificação</Label>
				<Text>{message || '—'}</Text>
			</Section>
		</>
	);
}

function JustificationEditable({ cause, message, onSubmit, setCause, setMessage }: { cause?: GtfsCause, message: string, onSubmit: () => void, setCause: (v: GtfsCause) => void, setMessage: (v: string) => void }) {
	return (
		<>
			<Combobox
				label="Motivo da justificação"
				onChange={setCause}
				placeholder="Selecione o motivo da justificação"
				value={cause}
				data={gtfsCauseSchema.options.map(cause => ({
					icon: CauseIcons[cause],
					label: Translations.CAUSE[cause],
					value: cause,
				}))}
				fullWidth
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

export function AcceptanceStatus({ grade }: { grade: RideAcceptance['acceptance_status'] }) {
	//
	// A. Setup variables
	const { actions } = useRidesDetailAcceptanceContext();
	const [isEditing, setIsEditing] = useState(false);
	const [status, setStatus] = useState<RideAcceptance['acceptance_status']>(grade);

	//
	// B. Handle actions
	const handleSubmit = async () => {
		try {
			await actions.changeStatus(status);
			setIsEditing(false);
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao alterar estado da aceitação',
			});
		}
	};

	//
	// C. Render components

	if (isEditing) {
		return (
			<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
				<Combobox
					label="Status da justificação"
					onChange={value => setStatus(value as RideAcceptance['acceptance_status'])}
					value={status}
					data={RideAcceptanceStatusSchema.options.map(status => ({
						icon: AcceptanceStatusProps[status].icon,
						label: AcceptanceStatusProps[status].label,
						value: status,
					}))}
					fullWidth
				/>
				<IconButton
					aria-label="Confirmar novo estado"
					icon={<IconCheck />}
					onClick={handleSubmit}
					variant="subtle"
				/>
			</Section>
		);
	}

	return (
		<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
			<AcceptanceStatusTag grade={grade} />
			<HasPermission
				action={Permissions.rides.actions.acceptance_change_status}
				scope={Permissions.rides.scope}
			>
				<IconButton
					aria-label="Editar estado"
					icon={<IconEdit />}
					onClick={() => setIsEditing(true)}
					variant="subtle"
				/>
			</HasPermission>
		</Section>
	);
}

export function RidesDetailAcceptanceJustification() {
	const { actions, data } = useRidesDetailAcceptanceContext();
	const { acceptance } = data;

	if (!acceptance) return null;

	const { acceptance_status, justification } = acceptance;

	const [message, setMessage] = useState(justification?.pto_message ?? '');
	const [cause, setCause] = useState<GtfsCause | undefined>(justification?.justification_cause);

	const handleSubmit = () => actions.justify(message, cause);

	const fallback = useMemo(() => <JustificationReadOnly cause={cause} message={message} />, [cause, message]);

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>Justificação</Label>
			<AcceptanceStatus grade={acceptance_status} />
			<HasPermission
				action={acceptance_status !== RideAcceptanceStatusSchema.Values.justification_required ? 'NONE' : Permissions.rides.actions.acceptance_justify}
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
