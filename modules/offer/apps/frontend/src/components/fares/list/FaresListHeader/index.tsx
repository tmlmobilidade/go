'use client';

/* * */

import { openCreateFareModal } from '@/components/fares/create/FareCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useFaresListFilterSearch } from '../filters/FaresListFilterSearch/use-fares-list-filter-search';
import { useFaresListData } from '../use-fares-list-data';

/* * */

export function FaresListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useFaresListData();
	const search = useFaresListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:fares.list.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.fares.actions.create} scope={PermissionCatalog.all.fares.scope}>
					<Button label={t('default:fares.create.title')} leftSection={<IconPlus />} onClick={openCreateFareModal} />
				</HasPermission>
			)}
		/>
	);
}
