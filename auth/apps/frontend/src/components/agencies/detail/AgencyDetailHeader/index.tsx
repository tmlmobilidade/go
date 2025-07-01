'use client';

/* * */

import { AgencyDetailMode, useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Section, Spacer, Tag, Text } from '@tmlmobilidade/ui';

/* * */

export function AgencyDetailHeader() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	return (
		<>
			<BackButton />
			<Section alignItems="center" flexDirection="row" flexWrap="nowrap" gap="sm">
				<Tag label={agencyDetailContext.data.id || 'Nova Agência'} variant="muted" />
				<Text size="lg">{agencyDetailContext.data.form.values.name}</Text>
			</Section>
			<Spacer />
			<Button
				disabled={!agencyDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label={agencyDetailContext.flags.mode === AgencyDetailMode.CREATE ? 'Publicar' : 'Guardar'}
				loading={agencyDetailContext.flags.isSaving}
				onClick={agencyDetailContext.actions.saveAgency}
				variant="primary"
			/>
			{agencyDetailContext.flags.mode === AgencyDetailMode.EDIT && (
				<Button
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={agencyDetailContext.actions.deleteAgency}
					variant="danger"
				/>
			)}
		</>
	);

	//
}
