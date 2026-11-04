'use client';

/* * */

import { openCreateAnnotationModal } from '@/components/annotations/create/AnnotationCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsListFilterSearch } from '../AnnotationsListFilterSearch/use-annotations-list-filter-search';
import { useAnnotationsListData } from '../use-annotations-list-data';

/* * */

export function AnnotationsListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useAnnotationsListData();
	const search = useAnnotationsListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:annotations.list.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.annotations.actions.create} scope={PermissionCatalog.all.annotations.scope}>
					<Button label={t('default:annotations.create.title')} leftSection={<IconPlus />} onClick={openCreateAnnotationModal} />
				</HasPermission>
			)}
		/>
	);
}
