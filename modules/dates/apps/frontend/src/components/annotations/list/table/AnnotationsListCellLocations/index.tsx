'use client';

import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { LocationsTagGroup, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AnnotationsListCellLocationsProps {
	locations: Annotation['locations']
}

/* * */

export function AnnotationsListCellLocations({ locations }: AnnotationsListCellLocationsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	if (!locations?.length) return <Text size="sm">{t('annotations:list.AnnotationsListCellLocations.empty')}</Text>;

	return <LocationsTagGroup locations={locations} groups />;
}
