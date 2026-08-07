/* * */

import { openPlanExportModal } from '@/components/plans/exporter/PlanExportModalOpen';
import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { openPlanPostersExportModal } from '@/components/plans/Posters/PlanPostersModalOpen';
import { IconDots, IconFileDownload, IconFileTypePdf } from '@tabler/icons-react';
import { Label, Menu, MenuItem, MenuLabel, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Planos</Label>
			<Spacer />
			<SearchInput onChange={plansListContext.filters.search.set} value={plansListContext.filters.search.value} />
			<Menu icon={IconDots} label="Mais opções">
				<MenuLabel>Ações</MenuLabel>
				<MenuItem
					leftSection={<IconFileDownload size={20} />}
					onClick={openPlanExportModal}
					title="Exportar planos"
				/>
				<MenuItem
					leftSection={<IconFileTypePdf size={20} />}
					onClick={openPlanPostersExportModal}
					title="Gerar PDFs"
				/>
			</Menu>
		</Toolbar>
	);

	//
}
