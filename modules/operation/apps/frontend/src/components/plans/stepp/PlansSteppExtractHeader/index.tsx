'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closePlansSteppExtractModal } from '../PlansSteppExtract.modal';
import { usePlansSteppExtractFormContext } from '../PlansSteppExtractForm.context';

/* * */

export function PlansSteppExtractHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, status } = usePlansSteppExtractFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closePlansSteppExtractModal} type="close" />
			<Label size="lg" singleLine>{t('default:plans.stepp.PlansSteppExtractHeader.title')}</Label>
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled}
				label={t('default:plans.stepp.PlansSteppExtractHeader.export')}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
