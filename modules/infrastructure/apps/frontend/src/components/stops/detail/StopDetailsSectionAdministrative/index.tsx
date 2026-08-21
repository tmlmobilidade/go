'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Translations } from '@/lib/translations';
import { StopJurisdictionSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, useLocationsContext, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopDetailsSectionAdministrative() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const stopJurisdictionOptions = StopJurisdictionSchema.options.map(value => ({
		label: Translations.JURISDICTION[value],
		value: value,
	}));

	const associatedDistrictValue = useMemo(() => {
		// Skip if districts are unavailable
		if (locationsContext.data.districts.size === 0) return;
		// Skip if stop does not yet have a district
		if (!stopDetailContext.data.stop?.district_id) return;
		// Get the district from the map
		const districtId = stopDetailContext.data.stop.district_id;
		const matchingDistrictData = locationsContext.actions.getDistrict(districtId);
		// Return if no matching district data is found
		if (!matchingDistrictData) return;
		// Return the matching data
		return `${matchingDistrictData.name} (${matchingDistrictData._id})`;
	}, [stopDetailContext.data.stop, locationsContext]);

	const associatedMunicipalityValue = useMemo(() => {
		// Skip if municipalities are unavailable
		if (locationsContext.data.municipalities.size === 0) return;
		// Skip if stop does not yet have a municipality
		if (!stopDetailContext.data.stop?.municipality_id) return;
		// Get the municipality from the map
		const municipalityId = stopDetailContext.data.stop.municipality_id;
		const matchingMunicipalityData = locationsContext.actions.getMunicipality(municipalityId);
		// Return if no matching municipality data is found
		if (!matchingMunicipalityData) return;
		// Return the matching data
		return `${matchingMunicipalityData.name} (${matchingMunicipalityData._id})`;
	}, [stopDetailContext.data.stop, locationsContext]);

	const associatedParishValue = useMemo(() => {
		// Skip if parishes are unavailable
		if (locationsContext.data.parishes.size === 0) return;
		// Skip if stop does not yet have a parish
		if (!stopDetailContext.data.stop?.parish_id) return;
		// Get the parish from the map
		const parishId = stopDetailContext.data.stop.parish_id;
		const matchingParishData = locationsContext.actions.getParish(parishId);
		// Return if no matching parish data is found
		if (!matchingParishData) return;
		// Return the matching data
		return `${matchingParishData.name} (${matchingParishData._id})`;
	}, [stopDetailContext.data.stop, locationsContext]);

	const associatedLocalityValue = useMemo(() => {
		// Skip if localities are unavailable
		if (locationsContext.data.localities.size === 0) return;
		// Skip if stop does not yet have a locality
		if (!stopDetailContext.data.stop?.locality_id) return;
		// Get the locality from the map
		const localityId = stopDetailContext.data.stop.locality_id;
		const matchingLocalityData = locationsContext.actions.getLocality(localityId);
		// Return if no matching locality data is found
		if (!matchingLocalityData) return;
		// Return the matching data
		return `${matchingLocalityData.name} (${matchingLocalityData._id})`;
	}, [stopDetailContext.data.stop, locationsContext]);

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações sobre a localização administrativa e responsabilidade de gestão desta paragem."
			title="Informação Administrativa"
		>
			<Section>
				<Grid>
					<Select
						key={stopDetailContext.data.form.key('jurisdiction')}
						data={stopJurisdictionOptions}
						label="Jurisdição"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('jurisdiction')}
					/>
				</Grid>
			</Section>
			<Section>
				<Grid columns="ab" gap="md">
					<ValueDisplay label="Distrito" value={associatedDistrictValue ?? 'N/A'} variant="bordered" />
					<ValueDisplay label="Municipio" value={associatedMunicipalityValue ?? 'N/A'} variant="bordered" />
					<ValueDisplay label="Freguesia" value={associatedParishValue ?? 'N/A'} variant="bordered" />
					<ValueDisplay label="Localidade" value={associatedLocalityValue ?? 'N/A'} variant="bordered" />
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
