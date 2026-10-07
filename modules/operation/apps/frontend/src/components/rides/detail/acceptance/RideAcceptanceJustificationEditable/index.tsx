'use client';

import { type AlertCause, AlertCauseValues } from '@tmlmobilidade/go-types-operation';
import { Button, Select, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RideAcceptanceJustificationEditableProps {
	cause?: AlertCause
	isSubmitting?: boolean
	manualTripId: string
	message: string
	onSubmit: () => void
	setCause: (value: AlertCause) => void
	setManualTripId: (value: string) => void
	setMessage: (value: string) => void
}

/* * */

export function RideAcceptanceJustificationEditable({
	cause,
	isSubmitting,
	manualTripId,
	message,
	onSubmit,
	setCause,
	setManualTripId,
	setMessage,
}: RideAcceptanceJustificationEditableProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<>
			<Select
				disabled={isSubmitting}
				label={t('default:rides.acceptance.RideAcceptanceJustification.fields.cause.label')}
				onChange={setCause}
				placeholder={t('default:rides.acceptance.RideAcceptanceJustification.fields.cause.placeholder')}
				value={cause}
				w="100%"
				data={AlertCauseValues.map(option => ({
					label: t(`shared:alerts.causes.${option}.title`),
					value: option,
				}))}
			/>
			<Textarea
				disabled={isSubmitting}
				label={t('default:rides.acceptance.RideAcceptanceJustification.fields.message.label')}
				minRows={2}
				onChange={e => setMessage(e.target.value)}
				value={message}
				w="100%"
				autosize
			/>
			<TextInput
				disabled={isSubmitting}
				label={t('default:rides.acceptance.RideAcceptanceJustification.fields.manual_trip_id.label')}
				onChange={e => setManualTripId(e.target.value)}
				value={manualTripId ?? ''}
				w="100%"
			/>
			<Button
				disabled={isSubmitting}
				label={t('default:rides.acceptance.RideAcceptanceJustification.SubmitButton.label')}
				loading={isSubmitting}
				onClick={onSubmit}
				fullWidth
			/>
		</>
	);

	//
}
