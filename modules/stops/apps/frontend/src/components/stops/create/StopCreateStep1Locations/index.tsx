'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { type Location } from '@tmlmobilidade/types';
import { ContextFormController, Grid, Section, useContextFormWatch, useLocationsContext, ValueDisplay } from '@tmlmobilidade/ui';
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
	const districtId = useContextFormWatch({ control: form.control, name: 'district_id' });
	const municipalityId = useContextFormWatch({ control: form.control, name: 'municipality_id' });
	const parishId = useContextFormWatch({ control: form.control, name: 'parish_id' });
	const localityId = useContextFormWatch({ control: form.control, name: 'locality_id' });

	const getNameFromMap = (map: Map<string, { name?: string }>, id: string | undefined) => {
		return id ? map.get(id)?.name : undefined;
	};

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
			if (result?.district?._id) form.setValue('district_id', result.district._id);
			if (result?.locality?._id) form.setValue('locality_id', result.locality._id);
			if (result?.municipality?._id) form.setValue('municipality_id', result.municipality._id);
			if (result?.parish?._id) form.setValue('parish_id', result.parish._id);
		});

		return () => {
			cancelled = true;
		};
	}, [form, locationsContext.actions, stopCreateContext.data.coordinates]);

	return (
		<Section>
			<ContextFormController
				control={form.control}
				name="district_id"
				render={() => (
					<Grid columns="ab" gap="md">
						<ValueDisplay label="Distrito" value={locationData?.district?.name ?? getNameFromMap(locationsContext.data.districts_map, districtId) ?? 'N/A'} variant="bordered" />
						<ValueDisplay label="Município" value={locationData?.municipality?.name ?? getNameFromMap(locationsContext.data.municipalities_map, municipalityId) ?? 'N/A'} variant="bordered" />
						<ValueDisplay label="Freguesia" value={locationData?.parish?.name ?? getNameFromMap(locationsContext.data.parishes_map, parishId) ?? 'N/A'} variant="bordered" />
						<ValueDisplay label="Localidade" value={locationData?.locality?.name ?? getNameFromMap(locationsContext.data.localitites_map, localityId) ?? 'N/A'} variant="bordered" />
					</Grid>
				)}
			/>
		</Section>
	);

	//
}
