'use client';

import { Latitude, LatitudeSchema, Longitude, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { CoordinatesInput, Section, useStandardFormWatch } from '@tmlmobilidade/ui';

import { useStopsCreateFormContext } from '../StopsCreateForm.context';

type Coords = [number | undefined, number | undefined];

/* * */

export function StopsCreateStepLocationCoordinatesInput() {
	//

	//
	// A. Setup variables

	const { form } = useStopsCreateFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

	//
	// B. Handle actions

	const handleSetCoordinates = ([lat, lng]: Coords) => {
		// const validatedLatitude = LatitudeSchema.safeParse(lat);
		// const validatedLongitude = LongitudeSchema.safeParse(lng);
		// if (!validatedLatitude.success || !validatedLongitude.success) return;
		form.setValue('latitude', lat as Latitude);
		form.setValue('longitude', lng as Longitude);
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<CoordinatesInput
				onChange={handleSetCoordinates}
				onDraftChange={handleSetCoordinates}
				value={[latitudeValue, longitudeValue]}
			/>
		</Section>
	);
}
