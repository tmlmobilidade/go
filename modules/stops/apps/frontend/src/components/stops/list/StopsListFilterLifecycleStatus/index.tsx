'use client';

import { Translations } from '@/lib/translations';
import { FilterTypeList } from '@tmlmobilidade/ui';

import { useStopsListFilterLifecycleStatus } from './use-stops-list-filter-lifecycle-status';

/* * */

export function StopsListFilterLifecycleStatus() {
	//

	//
	// A. Setup variables

	const filterLifecycleStatus = useStopsListFilterLifecycleStatus();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterLifecycleStatus.isActive}
			label="Estado"
			onChange={filterLifecycleStatus.set}
			options={filterLifecycleStatus.options.map(option => ({
				...option,
				label: Translations.LIFECYCLE_STATUS[option.value as keyof typeof Translations.LIFECYCLE_STATUS],
			}))}
			isMultiple
			withToggleAll
		/>
	);

	//
}
