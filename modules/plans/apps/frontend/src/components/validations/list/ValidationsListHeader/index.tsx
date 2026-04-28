/* * */

import { openCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsListHeader() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('plans:validations.list.ValidationsListHeader.title')}</Label>
			<Spacer />
			<SearchInput onChange={validationsListContext.filters.search.set} value={validationsListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.gtfs_validations.actions.create} scope={PermissionCatalog.all.gtfs_validations.scope}>
				<Button label={t('plans:validations.list.ValidationsListHeader.actions.new.label')} leftSection={<IconPlus />} onClick={openCreateValidationModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
