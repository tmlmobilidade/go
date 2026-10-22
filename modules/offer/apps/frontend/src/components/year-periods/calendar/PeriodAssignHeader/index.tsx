'use client';

import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { usePeriodAssignContext } from '../PeriodAssign.context';
import { closeAsignPeriodModal } from '../PeriodAssign.modal';

/* * */

export function PeriodAssignHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, status, values } = usePeriodAssignContext();
	const { t } = useTranslation();
	const isCreating = values.assignmentMode === 'create';

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeAsignPeriodModal} type="close" />
			<Tag label={t('default:periods.assignment.title')} variant="muted" />
			<Spacer />
			<Button
				disabled={isCreating ? !capabilities.createEnabled : !capabilities.updateEnabled}
				label={t('default:periods.assignment.submit')}
				loading={!!status.isCreating || !!status.isUpdating}
				onClick={isCreating ? actions.create : actions.update}
				variant="primary"
			/>
		</Toolbar>
	);
}
