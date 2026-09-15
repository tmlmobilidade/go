/* * */

import { openPlanPostersExtractModal } from '@/components/plans/extract/posters/PlanPostersExtract.modal';
import { PlansListFilterSearch } from '@/components/plans/list/filters/PlansListFilterSearch';
import { IconDots, IconFileTypePdf } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { HasPermission, Label, LoadingActivity, Menu, MenuItem, MenuLabel, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { usePlansListData } from '../use-plans-list-data';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = usePlansListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Planos</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<PlansListFilterSearch />
			<Menu icon={IconDots} label="Extrair">
				<MenuLabel>Exportações</MenuLabel>
				<HasPermission action={PermissionCatalog.all.plans.actions.generate_pdf_posters} scope={PermissionCatalog.all.plans.scope}>
					<MenuItem
						leftSection={<IconFileTypePdf size={20} />}
						onClick={openPlanPostersExtractModal}
						title="Extrair PDFs"
					/>
				</HasPermission>
			</Menu>
		</Toolbar>
	);
}
