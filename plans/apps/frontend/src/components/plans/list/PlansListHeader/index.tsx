/* * */

import { openCreatePlanModal } from '@/components/plans/detail/CreatePlanModal';
import { usePlansListContext } from '@/contexts/PlansList.context';
import { IconPlus } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, SearchInput, Spacer } from '@tmlmobilidade/ui';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps singleLine>Planos</Label>
			<Spacer />
			<SearchInput onChange={plansListContext.actions.setFilterSearch} value={plansListContext.filters.search} />
			<HasPermission action={Permissions.plans.actions.create} scope={Permissions.plans.scope}>
				<Button label="Novo plano" leftSection={<IconPlus size={20} />} onClick={openCreatePlanModal} />
			</HasPermission>
		</>
	);

	//
}
