'use client';

/* * */

import { openCreateEventModal } from '@/components/events/create/EventCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useEventsListFilterSearch } from '../EventsListFilterSearch/use-events-list-filter-search';
import { useEventsListData } from '../use-events-list-data';

/* * */

export function EventsListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useEventsListData();
	const search = useEventsListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:events.list.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.events.actions.create} scope={PermissionCatalog.all.events.scope}>
					<Button label={t('default:events.create.title')} leftSection={<IconPlus />} onClick={openCreateEventModal} />
				</HasPermission>
			)}
		/>
	);
}
