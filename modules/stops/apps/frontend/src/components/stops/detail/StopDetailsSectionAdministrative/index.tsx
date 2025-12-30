'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Translations } from '@/lib/translations';
import { StopJurisdictionSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionAdministrative() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const stopDetailContext = useStopDetailContext();
	const { t } = useTranslation('stops', { keyPrefix: 'detail.sections.administrative' });
	const { t: tTypes } = useTranslation('stops', { keyPrefix: Translations.JURISDICTION });

	//
	// B. Transform data

	const stopJurisdictionOptions = StopJurisdictionSchema.options.map(value => ({
		label: tTypes(value),
		value: value,
	}));

	const associatedDistrict = useMemo(() => {
		// Skip if districts are unavailable
		if (!locationsContext.data.districts_map) return;
		// Skip if stop does not yet have a district
		if (!stopDetailContext.data.stop?.district_id) return;
		// Get the district from the map
		const districtId = stopDetailContext.data.stop.district_id;
		const matchingDistrictData = locationsContext.data.districts_map.get(districtId);
		// Return if no matching district data is found
		if (!matchingDistrictData) return;
		// Return the matching data
		return matchingDistrictData;
	}, [stopDetailContext.data.stop, locationsContext.data.districts_map]);

	const associatedMunicipality = useMemo(() => {
		// Skip if municipalities are unavailable
		if (!locationsContext.data.municipalities_map) return;
		// Skip if stop does not yet have a municipality
		if (!stopDetailContext.data.stop?.municipality_id) return;
		// Get the municipality from the map
		const municipalityId = stopDetailContext.data.stop.municipality_id;
		const matchingMunicipalityData = locationsContext.data.municipalities_map.get(municipalityId);
		// Return if no matching municipality data is found
		if (!matchingMunicipalityData) return;
		// Return the matching data
		return matchingMunicipalityData;
	}, [stopDetailContext.data.stop, locationsContext.data.municipalities_map]);

	const associatedParish = useMemo(() => {
		// Skip if parishes are unavailable
		if (!locationsContext.data.parishes_map) return;
		// Skip if stop does not yet have a parish
		if (!stopDetailContext.data.stop?.parish_id) return;
		// Get the parish from the map
		const parishId = stopDetailContext.data.stop.parish_id;
		const matchingParishData = locationsContext.data.parishes_map.get(parishId);
		// Return if no matching parish data is found
		if (!matchingParishData) return;
		// Return the matching data
		return matchingParishData;
	}, [stopDetailContext.data.stop, locationsContext.data.parishes_map]);

	const associatedLocality = useMemo(() => {
		// Skip if localities are unavailable
		if (!locationsContext.data.localities_map) return;
		// Skip if stop does not yet have a locality
		if (!stopDetailContext.data.stop?.locality_id) return;
		// Get the locality from the map
		const localityId = stopDetailContext.data.stop.locality_id;
		const matchingLocalityData = locationsContext.data.localities_map.get(localityId);
		// Return if no matching locality data is found
		if (!matchingLocalityData) return;
		// Return the matching data
		return matchingLocalityData;
	}, [stopDetailContext.data.stop, locationsContext.data.localities_map]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section>
				<Grid>
					<Select
						key={stopDetailContext.data.form.key('jurisdiction')}
						data={stopJurisdictionOptions}
						label={t('fields.jurisdiction')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('jurisdiction')}
					/>
				</Grid>
			</Section>
			<Section>
				<Grid columns="ab" gap="md">
					<ValueDisplay label={t('fields.district')} value={associatedDistrict?.name ?? 'N/A'} bordered />
					<ValueDisplay label={t('fields.municipality')} value={associatedMunicipality?.name ?? 'N/A'} bordered />
					<ValueDisplay label={t('fields.parish')} value={associatedParish?.name ?? 'N/A'} bordered />
					<ValueDisplay label={t('fields.locality')} value={associatedLocality?.name ?? 'N/A'} bordered />
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
