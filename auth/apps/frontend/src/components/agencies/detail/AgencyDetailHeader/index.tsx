'use client';

/* * */

import { AgencyDetailMode, useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Section, Spacer, Tag, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function AgencyDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push('/users', { scroll: false });
	};

	//
	// C. Render components

	return (
		<>
			<BackButton onClick={handleClose} type="close" />
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
