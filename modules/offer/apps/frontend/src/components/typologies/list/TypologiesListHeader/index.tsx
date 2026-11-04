'use client';

/* * */

import { openCreateTypologyModal } from '@/components/typologies/create/TypologyCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useTypologiesListFilterSearch } from '../filters/TypologiesListFilterSearch/use-typologies-list-filter-search';
import { useTypologiesListData } from '../use-typologies-list-data';

/* * */

export function TypologiesListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useTypologiesListData();
	const search = useTypologiesListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:typologies.list.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.typologies.actions.create} scope={PermissionCatalog.all.typologies.scope}>
					<Button label={t('default:typologies.create.title')} leftSection={<IconPlus />} onClick={openCreateTypologyModal} />
				</HasPermission>
			)}
		/>
	);
}
