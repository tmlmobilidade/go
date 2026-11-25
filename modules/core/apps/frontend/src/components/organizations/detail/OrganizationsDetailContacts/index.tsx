'use client';

import { IconPlus } from '@tabler/icons-react';
import { Button, Collapsible, Label, Section, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { OrganizationsDetailContactFields } from '../OrganizationsDetailContactFields';
import { useOrganizationsDetailFormContext } from '../OrganizationsDetailForm.context';

/* * */

export function OrganizationsDetailContacts() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useOrganizationsDetailFormContext();
	const contacts = useStandardFormWatch({ control: form.control, name: 'contacts' }) ?? [];

	//
	// B. Handle actions

	const handleAdd = () => form.setValue('contacts', [...(form.getValues('contacts') ?? []), { _id: crypto.randomUUID(), job_description: '', name: '' }], { shouldDirty: true, shouldValidate: form.formState.isSubmitted });

	//
	// C. Render components

	return (
		<Collapsible title={`${t('organizations:detail.OrganizationsDetailContacts.title')} (${contacts.length})`}>
			<Section gap="lg">
				{!contacts.length && <Label variant="muted">{t('organizations:detail.OrganizationsDetailContacts.empty')}</Label>}
				{contacts.map((contact, index) => <OrganizationsDetailContactFields key={contact._id ?? index} index={index} />)}
				<Button
					disabled={!capabilities.editEnabled}
					icon={<IconPlus size={16} />}
					label={t('organizations:detail.OrganizationsDetailContacts.add')}
					onClick={handleAdd}
					variant="secondary"
				/>
			</Section>
		</Collapsible>
	);
}
