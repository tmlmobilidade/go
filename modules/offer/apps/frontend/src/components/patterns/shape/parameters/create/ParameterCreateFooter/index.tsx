'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { closeCreateParameterModal } from '@/components/patterns/shape/parameters/create/ParameterCreate.modal';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ParameterCreateFooter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const parameterCreateContext = useParameterCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>

			<Spacer />

			<Button label={t('default:scheduling.copy.cancel')} onClick={closeCreateParameterModal} variant="danger" />
			<Button
				disabled={!parameterCreateContext.capabilities.createEnabled}
				label={parameterCreateContext.flags.isEditing ? t('default:scheduling.copy.edit') : t('default:scheduling.copy.create')}
				onClick={parameterCreateContext.actions.submitParameter}
			/>

		</Toolbar>
	);

	//
}
