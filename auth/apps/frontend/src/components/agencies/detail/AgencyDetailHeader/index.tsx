'use client';

/* * */

import { AgencyDetailMode, useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
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
		const destUrl = keepUrlParams('/agencies', window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={agencyDetailContext.data.id || 'Nova Agência'} variant="secondary" />
			<Label size="lg" singleLine>{agencyDetailContext.data.form.values.name}</Label>
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
