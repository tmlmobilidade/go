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
		if (!value) return;
		const [lat, lng] = value;
		if (lat === undefined || lng === undefined) return;
		if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
		return stopCreateContext.actions.setLatLng(lat, lng);
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
