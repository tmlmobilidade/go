'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/go-utils';
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
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={agencyDetailContext.data.id} variant="secondary" />
			<Label size="lg" singleLine>{agencyDetailContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={agencyDetailContext.flags.read_only}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={agencyDetailContext.flags.saving}
				onClick={agencyDetailContext.actions.saveAgency}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
