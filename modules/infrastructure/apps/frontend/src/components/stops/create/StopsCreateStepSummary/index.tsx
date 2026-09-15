'use client';

import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { Divider, Section, useStandardFormWatch, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useStopsGetLocationData } from '../../shared/use-stops-get-location-data';
import { useStopsCreateFormContext } from '../StopsCreateForm.context';
import { StopsCreateStepLocationDetails } from '../StopsCreateStepLocationDetails';

/* * */

export function StopsCreateStepSummary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useStopsCreateFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });
	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Fetch data

	const { data: locationData } = useStopsGetLocationData({
		latitude: latitudeValue,
		longitude: longitudeValue,
	});

	//
	// C. Transform data

	const automaticShortName = useMemo(() => {
		if (!nameValue) return '';
		return getStopShortName(nameValue);
	}, [nameValue]);

	const automaticTtsName = useMemo(() => {
		if (!nameValue) return '';
		return getStopTtsName(nameValue);
	}, [nameValue]);

	const locationDisplay = useMemo(() => {
		// Extract the locality and municipality names
		const localityName = locationData?.locality?.name;
		const municipalityName = locationData?.municipality?.name;
		// Return the combined name if both locality and municipality names are available
		if (localityName && localityName !== municipalityName) return `${localityName}, ${municipalityName}`;
		// Return the municipality name if available or the locality name if not
		return municipalityName || localityName || '';
	}, [locationData?.locality?.name, locationData?.municipality?.name]);

	//
	// D. Render components

	return (
		<>
			<Section padding="lg">
				<div className={styles.wrapper}>
					<p className={styles.name}>{nameValue}</p>
					<p className={styles.location}>{locationDisplay}</p>
					<p className={styles.coordinates}>{latitudeValue}, {longitudeValue}</p>
				</div>
			</Section>

			<Divider />

			<Section>
				<ValueDisplay label={t('default:stops.create.StepSummary.fields.short_name.label')} value={automaticShortName} variant="plain" />
				<ValueDisplay label={t('default:stops.create.StepSummary.fields.tts_name.label')} value={automaticTtsName} variant="plain" />
			</Section>

			<Divider />

			<StopsCreateStepLocationDetails />
		</>
	);
}
