'use client';

import { Grid, Section, useStandardFormWatch, ValueDisplay } from '@tmlmobilidade/ui';

import { useStopsGetLocationData } from '../../shared/use-stops-get-location-data';
import { useStopsCreateFormContext } from '../StopsCreateForm.context';

/* * */

export function StopsCreateStepLocationDetails() {
	//

	//
	// A. Setup variables

	const { form } = useStopsCreateFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

	//
	// B: Fetch data

	const { data: locationData, isLoading } = useStopsGetLocationData({
		latitude: latitudeValue,
		longitude: longitudeValue,
	});

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="ab" gap="md">
				<ValueDisplay
					isLoading={isLoading}
					label="Distrito"
					value={locationData?.district?.name ?? 'N/A'}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label="Município"
					value={locationData?.municipality?.name ?? 'N/A'}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label="Freguesia"
					value={locationData?.parish?.name ?? 'N/A'}
					variant="bordered"
				/>
				<ValueDisplay
					isLoading={isLoading}
					label="Localidade"
					value={locationData?.locality?.name ?? 'N/A'}
					variant="bordered"
				/>
			</Grid>
		</Section>
	);
}
