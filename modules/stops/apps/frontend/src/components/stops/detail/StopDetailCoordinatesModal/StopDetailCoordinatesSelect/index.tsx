'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import {
	COORDINATES_PIN_DEBOUNCE_MS,
	coordinatesToSearchQuery,
} from '@/components/stops/detail/StopDetailCoordinatesModal/coordinates-query';
import { closeStopDetailCoordinatesModal } from '@/contexts/StopDetailCoordinates.modal';
import { Button, CoordinatesInput, Divider, Grid, Section, useMapContext } from '@tmlmobilidade/ui';
import { useEffect, useRef } from 'react';

/* * */

export function StopDetailCoordinatesSelect() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const mapContext = useMapContext();
	const pinDelayRef = useRef<null | ReturnType<typeof setTimeout>>(null);

	//
	// B. Handle actions

	const handleSetCoordinates = (value: [number, number]) => {
		stopDetailContext.data.form.setFieldValue('latitude', value[0]);
		stopDetailContext.data.form.setFieldValue('longitude', value[1]);
		if (pinDelayRef.current) clearTimeout(pinDelayRef.current);
		pinDelayRef.current = setTimeout(() => {
			pinDelayRef.current = null;
			mapContext.actions.handleSearch(coordinatesToSearchQuery(value[0], value[1]));
		}, COORDINATES_PIN_DEBOUNCE_MS);
	};

	useEffect(() => {
		return () => {
			if (pinDelayRef.current) clearTimeout(pinDelayRef.current);
		};
	}, []);

	//
	// C. Render components

	const latitude = stopDetailContext.data.form.values.latitude;
	const longitude = stopDetailContext.data.form.values.longitude;

	return (
		<Section gap="md" padding="md">
			<CoordinatesInput
				key={stopDetailContext.data.form.key('latitude')}
				disabled={stopDetailContext.flags.isReadOnly}
				onChange={handleSetCoordinates}
				value={[
					typeof latitude === 'number' ? latitude : 0,
					typeof longitude === 'number' ? longitude : 0,
				]}
			/>
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button label="Cancelar" onClick={closeStopDetailCoordinatesModal} type="button" variant="secondary" />
				<Button label="Definir coordenadas" onClick={() => handleSetCoordinates([latitude, longitude])} type="button" />
			</Grid>
		</Section>
	);

	//
}
