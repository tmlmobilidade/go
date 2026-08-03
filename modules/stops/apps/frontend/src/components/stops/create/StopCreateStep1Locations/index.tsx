'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { type Location } from '@tmlmobilidade/types';
import { ContextFormController, Grid, Section, useLocationsContext, ValueDisplay } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';

/* * */

export function StopCreateStep1Locations() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const locationsContext = useLocationsContext();
	const form = stopCreateContext.data.form;
	const [locationData, setLocationData] = useState<Location | null>(null);

	useEffect(() => {
		const [latitude, longitude] = stopCreateContext.data.coordinates;
		if (latitude === undefined || longitude === undefined) {
			setLocationData(null);
			return;
		}

		let cancelled = false;
		void locationsContext.actions.queryLocations(latitude, longitude).then((result) => {
			if (cancelled) return;

			setLocationData(result);
			form.setValue('district_id', result?.district?._id);
			form.setValue('locality_id', result?.locality?._id);
			form.setValue('municipality_id', result?.municipality?._id);
			form.setValue('parish_id', result?.parish?._id);
		});

		return () => {
			cancelled = true;
		};
	}, [form, locationsContext.actions, stopCreateContext.data.coordinates]);

	return (
		<Section>
			<Grid columns="ab" gap="md">
				<ContextFormController
					control={form.control}
					name="district_id"
					render={({ field }) => <ValueDisplay label="Distrito" value={locationData?.district?.name ?? field.value ?? 'N/A'} variant="bordered" />}
				/>
				<ContextFormController
					control={form.control}
					name="municipality_id"
					render={({ field }) => <ValueDisplay label="Município" value={locationData?.municipality?.name ?? field.value ?? 'N/A'} variant="bordered" />}
				/>
				<ContextFormController
					control={form.control}
					name="parish_id"
					render={({ field }) => <ValueDisplay label="Freguesia" value={locationData?.parish?.name ?? field.value ?? 'N/A'} variant="bordered" />}
				/>
				<ContextFormController
					control={form.control}
					name="locality_id"
					render={({ field }) => <ValueDisplay label="Localidade" value={locationData?.locality?.name ?? field.value ?? 'N/A'} variant="bordered" />}
				/>
			</Grid>
		</Section>
	);

	//
}
