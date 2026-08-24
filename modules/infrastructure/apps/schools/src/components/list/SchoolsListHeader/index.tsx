/* * */

import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { SchoolsListFilterSearch } from '../filters/SchoolsListFilterSearch';
import { useSchoolsListData } from '../use-schools-list-data';

/* * */

export function SchoolsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isLoading, isValidating, timestamp } = useSchoolsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('schools:list.SchoolsListHeader.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer shrink />
			<SchoolsListFilterSearch />
			<HasPermission action={PermissionCatalog.all.schools.actions.create} scope={PermissionCatalog.all.schools.scope}>
				<Button label="Nova Escola" leftSection={<IconPlus size={20} />} onClick={openSchoolCreateModal} />
			</HasPermission>
		</Toolbar>
	);
}
