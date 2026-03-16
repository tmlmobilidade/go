/* * */

import { openCreateHolidayModal } from '@/components/holidays/create/HolidayCreate.modal';
import { useHolidaysListContext } from '@/components/holidays/list/HolidaysList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function HolidaysListHeader() {
	//

	//
	// A. Setup variables

	const holidaysListContext = useHolidaysListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Feriados</Label>
			<Spacer />
			<SearchInput onChange={holidaysListContext.filters.search.set} value={holidaysListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.holidays.actions.create} scope={PermissionCatalog.all.holidays.scope}>
				<Button label="Novo Feriado" leftSection={<IconPlus />} onClick={openCreateHolidayModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
