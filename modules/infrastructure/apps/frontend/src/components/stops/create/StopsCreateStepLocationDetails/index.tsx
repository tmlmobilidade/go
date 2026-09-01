'use client';

import { Grid, Section, Skeleton, useStandardFormWatch, ValueDisplay } from '@tmlmobilidade/ui';

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
					label="Distrito"
					value={isLoading ? <Skeleton height={12} width={230} /> : locationData?.district?.name}
					variant="bordered"
				/>
				<ValueDisplay
					label="Município"
					value={isLoading ? <Skeleton height={12} width={230} /> : locationData?.municipality?.name}
					variant="bordered"
				/>
				<ValueDisplay
					label="Freguesia"
					value={isLoading ? <Skeleton height={12} width={230} /> : locationData?.parish?.name}
					variant="bordered"
				/>
				<ValueDisplay
					label="Localidade"
					value={isLoading ? <Skeleton height={12} width={230} /> : locationData?.locality?.name}
					variant="bordered"
				/>
			</Grid>
		</Section>
	);
}
