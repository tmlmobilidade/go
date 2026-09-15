'use client';

import { openHolidaysCreateModal } from '@/components/holidays/create/HolidaysCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { HolidaysListFilterSearch } from '../filters/HolidaysListFilterSearch';
import { useHolidaysListData } from '../use-holidays-list-data';

/* * */

export function HolidaysListHeader() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = useHolidaysListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Feriados</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<HolidaysListFilterSearch />
			<HasPermission action={PermissionCatalog.all.holidays.actions.create} scope={PermissionCatalog.all.holidays.scope}>
				<Button
					icon={<IconPlus size={20} />}
					label="Novo Feriado"
					onClick={openHolidaysCreateModal}
				/>
			</HasPermission>
		</Toolbar>
	);
}
