'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { ContextFormController, Divider, Grid, Section, useContextFormWatch, useLocationsContext, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function StopCreateStep3Summary() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const stopCreateContext = useStopCreateContext();
	const municipalityId = useContextFormWatch({ control: stopCreateContext.data.form.control, name: 'municipality_id' });
	const localityId = useContextFormWatch({ control: stopCreateContext.data.form.control, name: 'locality_id' });
	const latitude = useContextFormWatch({ control: stopCreateContext.data.form.control, name: 'latitude' });
	const longitude = useContextFormWatch({ control: stopCreateContext.data.form.control, name: 'longitude' });

	//
	// B. Transform data

	const locationString = useMemo(() => {
		// Skip if locations are not available
		if (!locationsContext.data.municipalities_map) return;
		if (!locationsContext.data.localitites_map) return;
		// Skip if stop does not have a municipality
		if (!municipalityId) return;
		// Get the corresponding location names
		const municipalityData = locationsContext.data.municipalities_map.get(municipalityId);
		const localityData = locationsContext.data.localitites_map.get(localityId);
		// Build the location string
		if (!municipalityData && !localityData) return;
		if (municipalityData && !localityData) return municipalityData.name;
		if (!municipalityData && localityData) return localityData.name;
		return `${localityData.name}, ${municipalityData.name}`;
	}, [localityId, locationsContext.data.localitites_map, locationsContext.data.municipalities_map, municipalityId]);

	//
	// C. Render components

	return (
		<>

			<Section padding="lg">
				<div className={styles.wrapper}>
					<ContextFormController control={stopCreateContext.data.form.control} name="name" render={({ field }) => <p className={styles.name}>{field.value}</p>} />
					<p className={styles.location}>{locationString ?? 'N/A'}</p>
					<p className={styles.coordinates}>{latitude}, {longitude}</p>
				</div>
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<ContextFormController control={stopCreateContext.data.form.control} name="short_name" render={({ field }) => <ValueDisplay label="Nome curto" value={field.value ?? ''} variant="bordered" />} />
					<ContextFormController control={stopCreateContext.data.form.control} name="tts_name" render={({ field }) => <ValueDisplay label="Nome tts" value={field.value ?? ''} variant="bordered" />} />
				</Grid>
			</Section>

		</>
	);

	//
}
