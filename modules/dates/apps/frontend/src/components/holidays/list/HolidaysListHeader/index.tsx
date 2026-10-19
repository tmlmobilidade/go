/* * */

import { openCreateHolidayModal } from '@/components/holidays/create/HolidayCreate.modal';
import { useHolidaysListContext } from '@/components/holidays/list/HolidaysList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';

/* * */

export function HolidaysListHeader() {
	//

	//
	// A. Setup variables

	const holidaysListContext = useHolidaysListContext();

	//
	// B. Render components

	return (
		<ListHeader
			count={holidaysListContext.data.filtered.length}
			search={<SearchField onChange={holidaysListContext.filters.search.set} value={holidaysListContext.filters.search.value} />}
			title="Feriados"
			actions={(
				<HasPermission action={PermissionCatalog.all.holidays.actions.create} scope={PermissionCatalog.all.holidays.scope}>
					<Button label="Novo Feriado" leftSection={<IconPlus />} onClick={openCreateHolidayModal} />
				</HasPermission>
			)}
		/>
	);

	//
}
