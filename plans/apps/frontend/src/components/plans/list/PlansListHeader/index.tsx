/* * */

import { OpenCreatePlanModal } from '@/components/plans/detail/CreatePlanModal';
import { IconPlus } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { Button, HasPermission, Label, Spacer } from '@tmlmobilidade/ui';

/* * */

export function PlansListHeader() {
	//
	// A. Render components

	return (
		<>
			<Label size="lg" caps>Planos</Label>
			<Spacer />
			<HasPermission
				action={Permissions.plans.actions.create}
				scope={Permissions.plans.scope}
			>
				<Button label="Novo plano" leftSection={<IconPlus size={20} />} onClick={OpenCreatePlanModal} />
			</HasPermission>
		</>
	);

	//
}
