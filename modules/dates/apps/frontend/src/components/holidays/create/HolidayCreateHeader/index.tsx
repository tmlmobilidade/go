'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeCreateHolidayModal } from '../HolidayCreate.modal';
import { useHolidaysCreateFormContext } from '../HolidaysCreateForm.context';

/* * */

export function HolidayCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useHolidaysCreateFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'title' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateHolidayModal} type="close" />
			<Tag label={t('default:holidays.create.title')} variant="muted" />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.holidays.actions.create} scope={PermissionCatalog.all.holidays.scope}>
				<CreateButton isDisabled={!capabilities.createEnabled} isLoading={status.isCreating} onClick={actions.create} />
			</HasPermission>
		</Toolbar>
	);

	//
}
