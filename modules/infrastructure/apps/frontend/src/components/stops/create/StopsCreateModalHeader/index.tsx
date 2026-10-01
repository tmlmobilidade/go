'use client';

import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeStopsCreateModal } from '../StopsCreate.modal';
import { useStopsCreateFormStepsContext } from '../StopsCreateFormSteps.context';

/* * */

export function StopsCreateModalHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { progress } = useStopsCreateFormStepsContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeStopsCreateModal} type="close" />
			<Label size="lg" singleLine>{t('default:stops.create.Header.title')}</Label>
			<Spacer />
			<Label size="md" caps singleLine>{t('default:stops.create.Header.step', { current: progress.current?.order + 1, total: progress.steps.length })}</Label>
		</Toolbar>
	);
}
