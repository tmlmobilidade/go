'use client';

import { FiltersBar, ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useListFilters } from '../use-list-filters';

/* * */

export function ListFilters() {
	//

	const { t } = useTranslation();
	const { status } = useListFilters();

	return (
		<FiltersBar>
			<ListFilter
				active={status.isActive}
				label={t('default:dev.fields.status')}
				onChange={status.set}
				options={status.options}
				isMultiple
				withToggleAll
			/>
		</FiltersBar>
	);
}
