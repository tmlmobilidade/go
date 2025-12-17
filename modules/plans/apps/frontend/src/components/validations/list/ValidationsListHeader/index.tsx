/* * */

import { openCreateValidationModal } from '@/components/validations/detail/CreateValidationModal';
import { useValidationsListContext } from '@/contexts/ValidationsList.context';
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
	const { t } = useTranslation('plans', { keyPrefix: 'validations.list.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={validationsListContext.actions.setFilterSearch} value={validationsListContext.filters.search} />
			<HasPermission action={PermissionCatalog.all.gtfs_validations.actions.create} scope={PermissionCatalog.all.gtfs_validations.scope}>
				<Button label="Nova validação" leftSection={<IconPlus />} onClick={openCreateValidationModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
