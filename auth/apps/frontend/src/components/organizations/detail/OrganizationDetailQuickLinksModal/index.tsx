'use client';

import { IconChooser } from '@/components/common/IconChooser';
import { OrganizationsDetailContextProvider, useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { CreateOrganizationSchema } from '@tmlmobilidade/types';
/* * */

import { Button, closeModal, Divider, Grid, Label, openModal, Section, Text, TextInput } from '@tmlmobilidade/ui';

/* * */

export const QUICK_LINKS_MODAL_ID = 'quick-links-modal';

/* * */

export const openOrganizationQuickLinksModal = ({ organization_id }: { organization_id: string }) => {
	openModal({
		children: (
			<OrganizationsDetailContextProvider organization_id={organization_id}>
				<QuickLinksModal />
			</OrganizationsDetailContextProvider>
		),
		closeOnClickOutside: false,
		modalId: QUICK_LINKS_MODAL_ID,
		padding: 0,
		size: 'auto',
		withCloseButton: false,
	});
};

/* * */

export default function QuickLinksModal() {
	//

	//
	// A. Setup variables

	const organizationsDetailsContext = useOrganizationsDetailContext();

	//
	// B. Render Components

	return (
		<>
			<Section gap="xs">
				<Label size="lg" caps>Novo link rápido</Label>
				<Text>Crie um novo link rápido para a organização</Text>
			</Section>

			<Divider />

			<Section>
				<TextInput
					label="Nome do link rápido"
					maxLength={255}
					placeholder="GO"
					withAsterisk={!CreateOrganizationSchema.shape.home_links}
					required
					{...organizationsDetailsContext.data.form.getInputProps('home_links.title')}
				/>
				<TextInput
					label="Link"
					maxLength={255}
					placeholder="https://www.carrismetropolitana.pt"
					withAsterisk={!CreateOrganizationSchema.shape.home_links}
					required
					{...organizationsDetailsContext.data.form.getInputProps('home_links.href')}
				/>
				<IconChooser />
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={organizationsDetailsContext.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(QUICK_LINKS_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						// disabled={!organizationsDetailsContext.flags.canSave}
						label="Criar link rápido"
						loading={organizationsDetailsContext.flags.loading}
						onClick={organizationsDetailsContext.actions.saveOrganization}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
