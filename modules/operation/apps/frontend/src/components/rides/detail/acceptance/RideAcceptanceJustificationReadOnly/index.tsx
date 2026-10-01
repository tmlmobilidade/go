'use client';

import { Label, Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAcceptanceJustificationReadOnly({ cause, manualTripId, message }: { cause?: string, manualTripId?: string, message?: string }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<>
			<Section gap="xs" padding="none">
				<Label>{t('default:rides.acceptance.RideAcceptanceJustification.readonly.cause.label')}</Label>
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

	//
}
