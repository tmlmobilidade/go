'use client';

import { AgencyTagGroup, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsAgenciesData } from '../../shared/use-annotations-agencies-data';

/* * */

interface AnnotationsListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function AnnotationsListCellAgencies({ agencyIds }: AnnotationsListCellAgenciesProps) {
	//

	//
	// A. Fetch data

	const { data } = useAnnotationsAgenciesData();
	const { t } = useTranslation();

	//
	// B. Render components

	if (!agencyIds.length) return <Text size="sm">{t('default:annotations.fields.agency_ids.unassigned')}</Text>;

	return (
		<AgencyTagGroup agencyIds={agencyIds} data={data} />
	);
}
