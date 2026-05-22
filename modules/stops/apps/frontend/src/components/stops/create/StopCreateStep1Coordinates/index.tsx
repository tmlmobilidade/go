'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { CoordinatesInput, Section } from '@tmlmobilidade/ui';

/* * */

export function StopCreateStep1Coordinates() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Handle actions

	const handleSetCoordinates = (value: [number | undefined, number | undefined] | undefined) => {
		if (!value) {
			stopCreateContext.data.form.setFieldValue('latitude', undefined as never);
			stopCreateContext.data.form.setFieldValue('longitude', undefined as never);
			return;
		}
		const [lat, lng] = value;
		if (lat !== undefined && lng !== undefined) {
			stopCreateContext.actions.setLatLng(lat, lng);
			return;
		}
		if (lat === undefined) {
			stopCreateContext.data.form.setFieldValue('latitude', undefined as never);
		} else {
			stopCreateContext.data.form.setFieldValue('latitude', lat as never);
		}
		if (lng === undefined) {
			stopCreateContext.data.form.setFieldValue('longitude', undefined as never);
		} else {
			stopCreateContext.data.form.setFieldValue('longitude', lng as never);
		}
	};

	//
	// C. Render components

	const latitude = stopCreateContext.data.form.values.latitude;
	const longitude = stopCreateContext.data.form.values.longitude;
	const value = !Number.isFinite(latitude) && !Number.isFinite(longitude)
		? undefined
		: [
			Number.isFinite(latitude) ? latitude : undefined,
			Number.isFinite(longitude) ? longitude : undefined,
		] as [number | undefined, number | undefined];

	return (
		<Section gap="md">
			<CoordinatesInput
				key={stopCreateContext.data.form.key('coordinates')}
				onChange={handleSetCoordinates}
				value={value}
			/>
		</Section>
	);

	//
}
