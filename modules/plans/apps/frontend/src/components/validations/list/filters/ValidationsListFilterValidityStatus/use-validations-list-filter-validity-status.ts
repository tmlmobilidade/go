'use client';

import { ValidityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/**
 * Manage the validity-status filter for the validations list.
 */
export function useValidationsListFilterValidityStatus(): UseFilterStateListReturnType {
	const { t } = useTranslation();

	return useFilterStateList(
		'validity_status',
		ValidityStatusSchema.options,
		ValidityStatusSchema.options.map(item => ({ label: t(`shared:status.validity_status.${item}`), value: item })),
	);
}
