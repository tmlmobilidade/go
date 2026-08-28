'use client';

import { closePlanChangeModal } from '@/components/plans/change/PlanChange.modal';
import { usePlanChangeContext } from '@/components/plans/change/PlanChangeForm.context';
import { CloseButton, Label, Spacer, Toolbar, UpdateButton } from '@tmlmobilidade/ui';

/* * */

export function PlanChangeHeader() {
	//

	//
	// A. Setup variables

	const changePlanContext = usePlanChangeContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closePlanChangeModal} type="close" />
			<Label size="lg" caps singleLine>Alterar Plano</Label>
			<Spacer />
			<UpdateButton
				isDisabled={!changePlanContext.capabilities?.updateEnabled}
				isLoading={changePlanContext.status.isUpdating}
				onClick={changePlanContext.actions.update}
			/>
		</Toolbar>
	);

	//
}
