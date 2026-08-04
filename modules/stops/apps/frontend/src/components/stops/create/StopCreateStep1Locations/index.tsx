'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { getLocationName } from '@/utils/get-location-name';
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
	const [isLoading, setIsLoading] = useState(false);
	const [locationData, setLocationData] = useState<Location | null>(null);

	useEffect(() => {
		const [latitude, longitude] = stopCreateContext.data.coordinates;
		if (latitude === undefined || longitude === undefined) {
			setLocationData(null);
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		setLocationData(null);
		setIsLoading(true);
		void locationsContext.actions.queryLocations(latitude, longitude).then((result) => {
			if (cancelled) return;

			setLocationData(result);
			form.setValue('district_id', result?.district?._id);
			form.setValue('locality_id', result?.locality?._id);
			form.setValue('municipality_id', result?.municipality?._id);
			form.setValue('parish_id', result?.parish?._id);
		}).catch(() => {
			if (cancelled) return;

			setLocationData(null);
		}).finally(() => {
			if (cancelled) return;

			setIsLoading(false);
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
					render={() => <ValueDisplay label="Distrito" value={getLocationName(locationData?.district ?? null, isLoading)} variant="bordered" />}
				/>
				<ContextFormController
					control={form.control}
					name="municipality_id"
					render={() => <ValueDisplay label="Município" value={getLocationName(locationData?.municipality ?? null, isLoading)} variant="bordered" />}
				/>
				<ContextFormController
					control={form.control}
					name="parish_id"
					render={() => <ValueDisplay label="Freguesia" value={getLocationName(locationData?.parish ?? null, isLoading)} variant="bordered" />}
				/>
				<ContextFormController
					control={form.control}
					name="locality_id"
					render={() => <ValueDisplay label="Localidade" value={getLocationName(locationData?.locality ?? null, isLoading)} variant="bordered" />}
				/>
			</Grid>
		</Section>
	);

	//
}
