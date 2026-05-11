'use client';

import { TagGroup, type TagProps, useLocationsContext } from '@tmlmobilidade/ui';

/* * */

interface AlertsListCellMunicipalitiesProps {
	values: string[]
}

/* * */

export function AlertsListCellMunicipalities({ values }: AlertsListCellMunicipalitiesProps) {
	//

	//
	// A. Setup variables

	const localtionsContext = useLocationsContext();

	//
	// B. Transform data

	const preparedTags = values
		.map((item): TagProps => {
			const municipalityData = localtionsContext.data.municipalities_map.get(item);
			if (!municipalityData) return null;
			return { label: municipalityData.name, variant: 'muted' };
		})
		.filter(Boolean);

	//
	// C. Render components

	return <TagGroup limit={2} tags={preparedTags} />;

	//
}
