'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Pane, Section, Spacer, StandardFormController, Tag, TextInput, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeBannersCreateModal } from '../BannersCreate.modal';
import { useBannersCreateFormContext } from '../BannersCreateForm.context';

/* * */

export function BannersCreate() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useBannersCreateFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'title' });
	const catalog = PermissionCatalog.all.banners;

	//
	// B. Render components

	return (
		<Pane
			header={[
				<Toolbar key="header">
					<CloseButton onClick={closeBannersCreateModal} type="close" />
					<Tag label={t('default:dev.banners.create')} variant="muted" />
					<Label size="lg" singleLine>{title}</Label>
					<Spacer />
					<HasPermission action={catalog.actions.update} scope={catalog.scope}>
						<CreateButton isDisabled={!capabilities?.createEnabled} isLoading={status.isCreating} onClick={actions.create} />
					</HasPermission>
				</Toolbar>,
			]}
		>
			<Section gap="md">
				<StandardFormController
					control={form.control}
					name="title"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:dev.fields.title')}
							onChange={field.onChange}
							value={field.value ?? ''}
							w="100%"
						/>
					)}
				/>
			</Section>
		</Pane>
	);
}
