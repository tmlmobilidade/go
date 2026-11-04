'use client';

/* * */

import { openCreateHolidayModal } from '@/components/holidays/create/HolidayCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useHolidaysListFilterSearch } from '../HolidaysListFilterSearch/use-holidays-list-filter-search';
import { useHolidaysListData } from '../use-holidays-list-data';

/* * */

export function HolidaysListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useHolidaysListData();
	const search = useHolidaysListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:holidays.list.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.holidays.actions.create} scope={PermissionCatalog.all.holidays.scope}>
					<Button label={t('default:holidays.create.title')} leftSection={<IconPlus />} onClick={openCreateHolidayModal} />
				</HasPermission>
			)}
		/>
	);
}
