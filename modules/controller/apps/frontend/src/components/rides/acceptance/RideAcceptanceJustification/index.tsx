'use client';

/* * */

import { AcceptanceStatusProps, AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { useRideAcceptanceContext } from '@/contexts/RideAcceptance.context';
import { CauseIcons } from '@/lib/icons';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { GtfsCause, gtfsCauseSchema, PermissionCatalog, RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/types';
import { Button, Combobox, HasPermission, IconButton, Label, Section, Text, Textarea, TextInput, useToast } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

function JustificationReadOnly({ cause, manualTripId, message }: { cause?: string, manualTripId?: string, message?: string }) {
	const { t } = useTranslation('controller', { keyPrefix: 'rides.acceptance.justification' });
	const { t: tCause } = useTranslation('controller', { keyPrefix: 'rides.acceptance' });
	return (
		<>
			<Label size="lg" caps>{t('title')}</Label>
			<Section gap="xs" padding="none">
				<Label>{t('readonly.cause')}</Label>
				<Text>{cause ? tCause(`cause.${cause}`) : '—'}</Text>
			</Section>
			<Section gap="xs" padding="none">
				<Label>{t('readonly.message')}</Label>
				<Text>{message || '—'}</Text>
			</Section>
			<Section gap="xs" padding="none">
				<Label>{t('readonly.manualTripId')}</Label>
				<Text>{manualTripId || '—'}</Text>
			</Section>
		</>
	);
}

function JustificationEditable({ cause, manualTripId, message, onSubmit, setCause, setManualTripId, setMessage }: { cause?: GtfsCause, manualTripId: string, message: string, onSubmit: () => void, setCause: (v: GtfsCause) => void, setManualTripId: (v: string) => void, setMessage: (v: string) => void }) {
	const { t } = useTranslation('controller', { keyPrefix: 'rides.acceptance.justification' });
	const { t: tCause } = useTranslation('controller', { keyPrefix: 'rides.acceptance' });
	return (
		<>
			<Combobox
				label={t('causeLabel')}
				onChange={setCause}
				placeholder={t('causePlaceholder')}
				value={cause}
				data={gtfsCauseSchema.options.map(cause => ({
					icon: CauseIcons[cause],
					label: tCause(`cause.${cause}`),
					value: cause,
				}))}
				fullWidth
			/>
			<Textarea
				label={t('messageLabel')}
				minRows={2}
				onChange={e => setMessage(e.target.value)}
				value={message}
				w="100%"
				autosize
			/>
			<TextInput
				label={t('manualTripIdLabel')}
				onChange={e => setManualTripId(e.target.value)}
				value={manualTripId ?? ''}
				w="100%"
			/>
			<Button label={t('submit')} onClick={onSubmit} fullWidth />
		</>
	);
}

export function AcceptanceStatus({ grade }: { grade: RideAcceptance['acceptance_status'] }) {
	//
	// A. Setup variables
	const { actions } = useRideAcceptanceContext();
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
				action={PermissionCatalog.all.rides.actions.acceptance_change_status}
				scope={PermissionCatalog.all.rides.scope}
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

export function RideAcceptanceJustification() {
	const { actions, data } = useRideAcceptanceContext();
	const { t } = useTranslation('controller', { keyPrefix: 'rides.acceptance.justification' });
	const { acceptance } = data;

	if (!acceptance) return null;

	const { acceptance_status, justification } = acceptance;

	const [message, setMessage] = useState(justification?.pto_message ?? '');
	const [cause, setCause] = useState<GtfsCause | undefined>(justification?.justification_cause);
	const [manualTripId, setManualTripId] = useState(justification?.manual_trip_id ?? '');

	const handleSubmit = () => actions.justify(message, cause, manualTripId);

	const fallback = useMemo(() => <JustificationReadOnly cause={cause} manualTripId={manualTripId} message={message} />, [cause, message, manualTripId]);

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>{t('title')}</Label>
			<AcceptanceStatus grade={acceptance_status} />
			<HasPermission
				action={acceptance_status !== RideAcceptanceStatusSchema.Values.justification_required ? 'NONE' : PermissionCatalog.all.rides.actions.acceptance_justify}
				fallback={fallback}
				scope={PermissionCatalog.all.rides.scope}
			>
				<JustificationEditable
					cause={cause}
					manualTripId={manualTripId}
					message={message}
					onSubmit={handleSubmit}
					setCause={setCause}
					setManualTripId={setManualTripId}
					setMessage={setMessage}
				/>
			</HasPermission>
		</Section>
	);
}
