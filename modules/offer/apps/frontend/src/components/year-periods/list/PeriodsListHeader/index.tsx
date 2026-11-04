'use client';

/* * */

import { openCreatePeriodModal } from '@/components/year-periods/create/PeriodCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { usePeriodsListFilterSearch } from '../PeriodsListFilterSearch/use-periods-list-filter-search';
import { usePeriodsListData } from '../use-periods-list-data';

/* * */

export function PeriodsListHeader() {
	//

	//
	// A. Setup variables

	const { data } = usePeriodsListData();
	const search = usePeriodsListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:periods.list.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.year_periods.actions.create} scope={PermissionCatalog.all.year_periods.scope}>
					<Button label={t('default:periods.create.title')} leftSection={<IconPlus />} onClick={openCreatePeriodModal} />
				</HasPermission>
			)}
		/>
	);
}
