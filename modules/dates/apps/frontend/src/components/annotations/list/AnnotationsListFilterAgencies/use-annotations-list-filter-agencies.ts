'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsAgenciesData } from '../../shared/use-annotations-agencies-data';

/* * */

export const ANNOTATIONS_WITHOUT_AGENCIES = '__unassigned__';

/** Annotations agencies URL filter, including records with no assigned agency. */
export function useAnnotationsListFilterAgencies(): UseFilterStateListReturnType {
	const { t } = useTranslation();
	const { ids, options } = useAnnotationsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.annotations.actions.read],
			scope: PermissionCatalog.all.annotations.scope,
		},
	});
	const filter = useFilterStateList('agency', [...ids, ANNOTATIONS_WITHOUT_AGENCIES], [
		{ label: t('default:annotations.fields.agency_ids.unassigned'), value: ANNOTATIONS_WITHOUT_AGENCIES },
		...options,
	]);
	return filter;
}
