/* * */

import { openCreatePeriodModal } from '@/components/periods/create/PeriodCreate.modal';
import { usePeriodsListContext } from '@/components/periods/list/PeriodsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PeriodsListHeader() {
	//

	//
	// A. Setup variables

	const periodsListContext = usePeriodsListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('dates:periods.list.PeriodsListHeader.title')}</Label>
			<Spacer />
			<SearchInput onChange={periodsListContext.filters.search.set} value={periodsListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.periods.actions.create} scope={PermissionCatalog.all.periods.scope}>
				<Button label={t('dates:periods.list.PeriodsListHeader.NewButton.label')} leftSection={<IconPlus />} onClick={openCreatePeriodModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
