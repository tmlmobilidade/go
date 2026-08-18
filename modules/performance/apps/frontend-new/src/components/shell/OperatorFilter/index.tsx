'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { OperatorSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function OperatorFilter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const agenciesContext = useAgenciesContext();
	const filtersContext = usePerformanceFiltersContext();

	//
	// B. Transform data

	const options = useMemo(() => agenciesContext.data.agencies.map(agency => ({
		code: agency.code,
		id: agency._id,
		name: agency.name,
		public_name: agency.public_name,
		short_name: agency.short_name,
	})), [agenciesContext.data.agencies]);

	//
	// C. Render components

	return (
		<OperatorSelect
			allLabel={t('filters.operator.all')}
			hint={t('filters.operator.hint')}
			label={t('filters.operator.label')}
			onChange={filtersContext.actions.setOperators}
			options={options}
			selectedCountLabel={count => t('filters.operator.selectedCount', { count })}
			value={filtersContext.filters.operator.values}
		/>
	);

	//
}
