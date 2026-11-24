'use client';

import { IconFileTypePdf } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { usePlanPostersExtractFormContext } from '../PlanPostersExtract.context';
import { closePlanPostersExtractModal } from '../PlanPostersExtract.modal';

/* * */

export function PlanPostersExtractHeader() {
	//

	//
	// A. Setup variables

	const context = usePlanPostersExtractFormContext();

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closePlanPostersExtractModal} type="close" />
			<Label size="lg" caps singleLine>{t('default:posterExport.PlanPostersExtractHeader.title')}</Label>
			<Spacer />
			<Button
				disabled={!context.flags.canSave}
				icon={<IconFileTypePdf />}
				label={t('default:posterExport.PlanPostersExtractHeader.exportButtonLabel')}
				loading={context.flags.loading}
				onClick={context.actions.exportPosters}
			/>
		</Toolbar>
	);

	//
}
