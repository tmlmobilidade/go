'use client';

/* * */

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopCreateStep1Locations() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const locationsContext = useLocationsContext();

	//
	// B. Transform data

	const associatedDistrict = useMemo(() => {
		// Skip if districts are unavailable
		if (!locationsContext.data.districts_map) return;
		// Skip if stop does not yet have a district
		if (!stopCreateContext.data.form.values.district_id) return;
		// Get the district from the map
		const districtId = stopCreateContext.data.form.values.district_id;
		const matchingDistrictData = locationsContext.data.districts_map.get(districtId);
		// Return if no matching district data is found
		if (!matchingDistrictData) return;
		// Return the matching data
		return matchingDistrictData;
	}, [stopCreateContext.data.form.values, locationsContext.data.districts_map]);

	const associatedMunicipality = useMemo(() => {
		// Skip if municipalities are unavailable
		if (!locationsContext.data.municipalities_map) return;
		// Skip if stop does not yet have a municipality
		if (!stopCreateContext.data.form.values.municipality_id) return;
		// Get the municipality from the map
		const municipalityId = stopCreateContext.data.form.values.municipality_id;
		const matchingMunicipalityData = locationsContext.data.municipalities_map.get(municipalityId);
		// Return if no matching municipality data is found
		if (!matchingMunicipalityData) return;
		// Return the matching data
		return matchingMunicipalityData;
	}, [stopCreateContext.data.form.values, locationsContext.data.municipalities_map]);

	const associatedParish = useMemo(() => {
		// Skip if parishes are unavailable
		if (!locationsContext.data.parishes_map) return;
		// Skip if stop does not yet have a parish
		if (!stopCreateContext.data.form.values.parish_id) return;
		// Get the parish from the map
		const parishId = stopCreateContext.data.form.values.parish_id;
		const matchingParishData = locationsContext.data.parishes_map.get(parishId);
		// Return if no matching parish data is found
		if (!matchingParishData) return;
		// Return the matching data
		return matchingParishData;
	}, [stopCreateContext.data.form.values, locationsContext.data.parishes_map]);

	const associatedLocality = useMemo(() => {
		// Skip if localities are unavailable
		if (!locationsContext.data.localities_map) return;
		// Skip if stop does not yet have a locality
		if (!stopCreateContext.data.form.values.locality_id) return;
		// Get the locality from the map
		const localityId = stopCreateContext.data.form.values.locality_id;
		const matchingLocalityData = locationsContext.data.localities_map.get(localityId);
		// Return if no matching locality data is found
		if (!matchingLocalityData) return;
		// Return the matching data
		return matchingLocalityData;
	}, [stopCreateContext.data.form.values, locationsContext.data.localities_map]);

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
