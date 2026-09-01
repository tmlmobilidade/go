/* * */

import { Divider, Section, useStandardFormWatch, ValueDisplay } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { useStopsGetLocationData } from '../../shared/use-stops-get-location-data';
import { useStopsCreateFormContext } from '../StopsCreateForm.context';
import { StopsCreateStepLocationDetails } from '../StopsCreateStepLocationDetails';

/* * */

export function StopsCreateStepSummary() {
	//

	//
	// A. Setup variables

	const { form } = useStopsCreateFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });
	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	const { data: locationData } = useStopsGetLocationData({
		latitude: latitudeValue,
		longitude: longitudeValue,
	});

	//
	// B. Render components

	return (
		<>
			<Section padding="lg">
				<div className={styles.wrapper}>
					<p className={styles.name}>{nameValue}</p>
					<p className={styles.location}>{locationData?.locality?.name} - {locationData?.municipality?.name}</p>
					<p className={styles.coordinates}>{latitudeValue}, {longitudeValue}</p>
				</div>
			</Section>

			<Divider />

			<Section>
				<ValueDisplay label="Nome curto" value="" variant="plain" />
				<ValueDisplay label="Nome tts" value="" variant="plain" />
			</Section>

			<StopsCreateStepLocationDetails />
		</>
	);
}
