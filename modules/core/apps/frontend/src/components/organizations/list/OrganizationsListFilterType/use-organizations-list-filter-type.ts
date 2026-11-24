'use client';

import { OrganizationTypeSchema } from '@tmlmobilidade/go-types-core';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/** Manages the organization type filter in the URL. */
export function useOrganizationsListFilterType(): UseFilterStateListReturnType {
	const { t } = useTranslation();
	const options = OrganizationTypeSchema.options.map(value => ({ label: t(`organizations:shared.types.${value}`), value }));
	return useFilterStateList('organization_type', OrganizationTypeSchema.options, options);
}
