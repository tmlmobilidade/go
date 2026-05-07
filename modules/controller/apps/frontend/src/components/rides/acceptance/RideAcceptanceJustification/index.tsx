'use client';
/* * */

import { AcceptanceStatusTag } from '@/components/common/AcceptanceStatusTag';
import { RideAcceptancePaymentRequest } from '@/components/rides/acceptance/RideAcceptancePaymentRequest';
import { useRideAcceptanceContext } from '@/contexts/RideAcceptance.context';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { AlertCause, AlertCauseSchema, PermissionCatalog, type RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/types';
import { Button, HasPermission, IconButton, Label, Section, Select, Text, Textarea, TextInput, useToast } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

function JustificationReadOnly({ cause, manualTripId, message }: { cause?: string, manualTripId?: string, message?: string }) {
	const { t } = useTranslation();
	return (
		<>
			<Label size="lg" caps>{t('default:rides.acceptance.RideAcceptanceJustification.title')}</Label>
			<Section gap="xs" padding="none">
				<Label>Motivo da justificação</Label>
				<Text>{cause || '—'}</Text>
			</Section>
			<Section gap="xs" padding="none">
				<Label>{t('default:rides.acceptance.RideAcceptanceJustification.readonly.message.label')}</Label>
				<Text>{message || '—'}</Text>
			</Section>
			<Section gap="xs" padding="none">
				<Label>{t('default:rides.acceptance.RideAcceptanceJustification.readonly.manual_trip_id.label')}</Label>
				<Text>{manualTripId || '—'}</Text>
			</Section>
		</>
	);
}

function JustificationEditable({ cause, manualTripId, message, onSubmit, setCause, setManualTripId, setMessage }: { cause?: AlertCause, manualTripId: string, message: string, onSubmit: () => void, setCause: (v: AlertCause) => void, setManualTripId: (v: string) => void, setMessage: (v: string) => void }) {
	//

	const { t } = useTranslation();

	return (
		<>
			<Select
				label="Motivo da justificação"
				onChange={setCause}
				placeholder={t('default:rides.acceptance.RideAcceptanceJustification.fields.cause.placeholder')}
				value={cause}
				w="100%"
				data={AlertCauseSchema.options.map(cause => ({
					label: t(`shared:alerts.causes.${cause}.title`),
					value: cause,
				}))}
			/>
			<Textarea
				label={t('default:rides.acceptance.RideAcceptanceJustification.fields.message.label')}
				minRows={2}
				onChange={e => setMessage(e.target.value)}
				value={message}
				w="100%"
				autosize
			/>
			<TextInput
				label={t('default:rides.acceptance.RideAcceptanceJustification.fields.manual_trip_id.label')}
				onChange={e => setManualTripId(e.target.value)}
				value={manualTripId ?? ''}
				w="100%"
			/>
			<Button label={t('default:rides.acceptance.RideAcceptanceJustification.SubmitButton.label')} onClick={onSubmit} fullWidth />
		</>
	);
}

export function AcceptanceStatus({ grade }: { grade: RideAcceptance['acceptance_status'] }) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions } = useRideAcceptanceContext();
	const [isEditing, setIsEditing] = useState(false);
	const [status, setStatus] = useState<RideAcceptance['acceptance_status']>(grade);

	//
	// B. Handle actions
	const handleSubmit = async () => {
		try {
			await actions.changeStatus(status);
			setIsEditing(false);
		} catch (error) {
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
				<Select
					clearable={false}
					onChange={value => setStatus(value as RideAcceptance['acceptance_status'])}
					value={status}
					w="100%"
					data={RideAcceptanceStatusSchema.options.map(status => ({
						label: t(`ride_status:acceptance_status.${status}`),
						value: status,
					}))}
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
	const { t } = useTranslation();
	const acceptance = data.acceptance;

	const [message, setMessage] = useState('');
	const [cause, setCause] = useState<AlertCause | undefined>(undefined);
	const [manualTripId, setManualTripId] = useState('');

	useEffect(() => {
		if (!acceptance) return;

		const j = acceptance.justification;

		setMessage(j?.pto_message ?? '');
		setCause(j?.justification_cause);
		setManualTripId(j?.manual_trip_id ?? '');
	}, [acceptance?._id]);

	const fallback = useMemo(() => (
		<JustificationReadOnly cause={cause} manualTripId={manualTripId} message={message} />
	), [cause, manualTripId, message]);

	const handleSubmit = () => actions.justify(message, cause, manualTripId);

	if (!acceptance) {
		return null;
	}

	const { acceptance_status } = acceptance;

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>{t('default:rides.acceptance.RideAcceptanceJustification.title')}</Label>
			<AcceptanceStatus grade={acceptance_status} />
			<RideAcceptancePaymentRequest />
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
