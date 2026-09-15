'use client';

import { openYearPeriodsCreateModal } from '@/components/year-periods/create/YearPeriodsCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { YearPeriodsListFilterSearch } from '../filters/YearPeriodsListFilterSearch';
import { useYearPeriodsListData } from '../use-year-periods-list-data';

/* * */

export function YearPeriodsListHeader() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = useYearPeriodsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Períodos</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<YearPeriodsListFilterSearch />
			<HasPermission action={PermissionCatalog.all.year_periods.actions.create} scope={PermissionCatalog.all.year_periods.scope}>
				<Button
					icon={<IconPlus size={20} />}
					label="Novo período"
					onClick={openYearPeriodsCreateModal}
				/>
			</HasPermission>
		</Toolbar>
	);
}
