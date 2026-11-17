'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { AlertCauseValues, type RideAcceptance, type RideJustification } from '@tmlmobilidade/go-types-operation';
import { Button, fetchApiData, Section, Select, Textarea, TextInput, useHandleAction } from '@tmlmobilidade/ui';
import { type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useRidesDetailRideId } from '../../shared/use-rides-detail-ride-id';
import { useRideAcceptanceData } from '../use-ride-acceptance-data';

/* * */

type JustifyRideAcceptanceBody = Pick<RideJustification, 'justification_cause' | 'manual_trip_id' | 'pto_message'>;

/* * */

export function RideAcceptanceJustificationEditable() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { rideId } = useRidesDetailRideId();
	const { mutate } = useRideAcceptanceData();

	//
	// B. Handle actions

	const { action: justify, isLoading } = useHandleAction<RideAcceptance, JustifyRideAcceptanceBody>({
		fetchFn: async body => await fetchApiData<RideAcceptance, JustifyRideAcceptanceBody>({
			body,
			method: 'PUT',
			url: API_ROUTES.operation.RIDE_ACCEPTANCES_JUSTIFY(rideId),
		}),
		onSuccess: () => mutate(),
	});

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isLoading) return;
		const data = new FormData(event.currentTarget);
		const cause = AlertCauseValues.find(option => option === data.get('justification_cause'));
		if (!cause) return;

		void justify({
			justification_cause: cause,
			manual_trip_id: String(data.get('manual_trip_id') ?? '') || undefined,
			pto_message: String(data.get('pto_message') ?? ''),
		});
	};

	//
	// C. Render components

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<Section gap="sm" padding="none">
				<Select
					disabled={isLoading}
					label={t('default:rides.acceptance.RideAcceptanceJustificationEditable.fields.cause.label')}
					name="justification_cause"
					placeholder={t('default:rides.acceptance.RideAcceptanceJustificationEditable.fields.cause.placeholder')}
					w="100%"
					data={AlertCauseValues.map(option => ({
						label: t(`shared:alerts.causes.${option}.title`),
						value: option,
					}))}
					required
				/>
				<Textarea
					disabled={isLoading}
					label={t('default:rides.acceptance.RideAcceptanceJustificationEditable.fields.message.label')}
					maxLength={5000}
					minLength={2}
					minRows={2}
					name="pto_message"
					w="100%"
					autosize
					required
				/>
				<TextInput
					disabled={isLoading}
					label={t('default:rides.acceptance.RideAcceptanceJustificationEditable.fields.manual_trip_id.label')}
					name="manual_trip_id"
					w="100%"
				/>
				<Button
					disabled={isLoading}
					label={t('default:rides.acceptance.RideAcceptanceJustificationEditable.submit')}
					loading={isLoading}
					type="submit"
				/>
			</Section>
		</form>
	);

	//
}
