/* * */

import { OpenCreatePlanModal } from '@/components/detail/CreatePlanModal';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, Spacer } from '@tmlmobilidade/ui';

/* * */

export function PlansListHeader() {
	//
	// A. Render components

	return (
		<>
			<Label size="lg" caps>Planos</Label>
			<Spacer />
			<Button label="Novo plano" leftSection={<IconPlus size={20} />} onClick={OpenCreatePlanModal} />
		</>
	);

	//
}
