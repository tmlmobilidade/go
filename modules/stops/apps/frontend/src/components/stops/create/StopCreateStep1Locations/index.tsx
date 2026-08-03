'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { Grid, Section, useLocationsContext, ValueDisplay } from '@tmlmobilidade/ui';
import { useCallback, useState } from 'react';

/* * */

export function StopCreateStep1Locations() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const locationsContext = useLocationsContext();
	const form = stopCreateContext.data.form;
	const [, forceFormUpdate] = useState(0);

	const handleFormValuesChange = useCallback(() => {
		forceFormUpdate(value => value + 1);
	}, []);

	form.watch('district_id', handleFormValuesChange);
	form.watch('municipality_id', handleFormValuesChange);
	form.watch('parish_id', handleFormValuesChange);
	form.watch('locality_id', handleFormValuesChange);

	//
	// B. Transform data

	const formValues = form.getValues();
	const associatedDistrict = formValues.district_id ? locationsContext.data.districts_map.get(formValues.district_id) : undefined;
	const associatedMunicipality = formValues.municipality_id ? locationsContext.data.municipalities_map.get(formValues.municipality_id) : undefined;
	const associatedParish = formValues.parish_id ? locationsContext.data.parishes_map.get(formValues.parish_id) : undefined;
	const associatedLocality = formValues.locality_id ? locationsContext.data.localitites_map.get(formValues.locality_id) : undefined;

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="ab" gap="md">
				<ValueDisplay label="Distrito" value={associatedDistrict?.name ?? 'N/A'} variant="bordered" />
				<ValueDisplay label="Município" value={associatedMunicipality?.name ?? 'N/A'} variant="bordered" />
				<ValueDisplay label="Freguesia" value={associatedParish?.name ?? 'N/A'} variant="bordered" />
				<ValueDisplay label="Localidade" value={associatedLocality?.name ?? 'N/A'} variant="bordered" />
			</Grid>
		</Section>
	);

	//
}
