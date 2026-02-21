'use client';

/* * */

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Divider, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopCreateStep3Summary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const locationsContext = useLocationsContext();
	const stopCreateContext = useStopCreateContext();

	//
	// B. Transform data

	const locationString = useMemo(() => {
		// Skip if locations are not available
		if (!locationsContext.data.municipalities_map) return;
		if (!locationsContext.data.localities_map) return;
		// Skip if stop does not have a municipality
		if (!stopCreateContext.data.form.values.municipality_id) return;
		// Get the corresponding location names
		const municipalityData = locationsContext.data.municipalities_map.get(stopCreateContext.data.form.values.municipality_id);
		const localityData = locationsContext.data.localities_map.get(stopCreateContext.data.form.values.locality_id);
		// Build the location string
		if (!municipalityData && !localityData) return;
		if (municipalityData && !localityData) return municipalityData.name;
		if (!municipalityData && localityData) return localityData.name;
		return `${localityData.name}, ${municipalityData.name}`;
	}, []);

	//
	// C. Render components

	return (
		<>

			<Section padding="lg">
				<div className={styles.wrapper}>
					<p className={styles.name}>{stopCreateContext.data.form.values.name}</p>
					<p className={styles.location}>{locationString ?? 'N/A'}</p>
					<p className={styles.coordinates}>{stopCreateContext.data.form.values.latitude}, {stopCreateContext.data.form.values.longitude}</p>
				</div>
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<ValueDisplay label={t('stops:stops.create.StopCreateStep3Summary.fields.short_name.label')} value={stopCreateContext.data.form.values.short_name} bordered />
					<ValueDisplay label={t('stops:stops.create.StopCreateStep3Summary.fields.tts_name.label')} value={stopCreateContext.data.form.values.tts_name} bordered />
				</Grid>
			</Section>

		</>
	);

	//
}
