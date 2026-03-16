'use client';

/* * */

import { usePlanChangeContext } from '@/components/plans/change/PlanChange.context';
import { closePlanChangeModal } from '@/components/plans/change/PlanChange.modal';
import { CloseButton, Label, SaveButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanChangeHeader() {
	//

	//
	// A. Setup variables

	const changePlanContext = usePlanChangeContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closePlanChangeModal} type="close" />
			<Label size="lg" caps singleLine>{t('plans:plans.change.PlanChangeHeader.title')}</Label>
			<Spacer />
			<SaveButton
				isDisabled={!changePlanContext.data.selected_validation_id}
				isLoading={changePlanContext.flags.isSaving}
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				onClick={changePlanContext.actions.save}
			/>
		</Toolbar>
	);

	//
}
