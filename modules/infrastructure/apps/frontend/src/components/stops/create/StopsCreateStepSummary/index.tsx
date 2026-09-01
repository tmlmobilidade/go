/* * */

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { StopCreateStepLocationLocationsCards } from '@/components/stops/create/StopCreateStepLocationLocationsCards';
import { Divider, Section, StandardFormController, useLocationsContext, ValueDisplay } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function StopsCreateStepSummary() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const locationsContext = useLocationsContext();

	const [latitude, longitude] = stopCreateContext.form.instance.getValues(['latitude', 'longitude']);
	const [localityId, municipalityId] = stopCreateContext.form.instance.getValues(['locality_id', 'municipality_id']);
	const [name, shortName, ttsName] = stopCreateContext.form.instance.getValues(['name', 'short_name', 'tts_name']);

	const locationLabel = useMemo(() => {
		const localityLabel = locationsContext.actions.getLocality(localityId)?.name;
		const municipalityLabel = locationsContext.actions.getMunicipality(municipalityId)?.name;

		if (localityLabel && municipalityLabel) {
			return `${localityLabel} - ${municipalityLabel}`;
		}

		return municipalityLabel;
	}, [localityId, municipalityId]);

	//
	// B. Render components

	return (
		<>
			<Section padding="lg">
				<div className={styles.wrapper}>
					<StandardFormController control={stopCreateContext.form.instance.control} name="name" render={({ field }) => <p className={styles.name}>{field.value}</p>} />
					<p className={styles.location}>{locationLabel}</p>
					<p className={styles.coordinates}>{latitude}, {longitude}</p>
				</div>
			</Section>

			<Divider />

			<Section>
				<StandardFormController control={stopCreateContext.form.instance.control} name="short_name" render={({ field }) => <ValueDisplay label="Nome curto" value={field.value} variant="plain" />} />
				<StandardFormController control={stopCreateContext.form.instance.control} name="tts_name" render={({ field }) => <ValueDisplay label="Nome tts" value={field.value} variant="plain" />} />
			</Section>

			<StopCreateStepLocationLocationsCards />
		</>
	);
}
