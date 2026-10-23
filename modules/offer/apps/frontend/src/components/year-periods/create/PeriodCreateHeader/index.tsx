'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeCreatePeriodModal } from '../PeriodCreate.modal';
import { usePeriodsCreateFormContext } from '../PeriodsCreateForm.context';

/* * */

export function PeriodCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = usePeriodsCreateFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreatePeriodModal} type="close" />
			<Tag label={t('default:periods.create.title')} variant="muted" />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.year_periods.actions.create} scope={PermissionCatalog.all.year_periods.scope}>
				<CreateButton isDisabled={!capabilities.createEnabled} isLoading={status.isCreating} onClick={actions.create} />
			</HasPermission>
		</Toolbar>
	);

	//
}
