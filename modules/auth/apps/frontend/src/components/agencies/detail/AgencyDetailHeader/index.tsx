'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencyDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const agencyDetailContext = useAgencyDetailContext();
	const { t } = useTranslation('auth', { keyPrefix: 'agencies.detail.header' });
	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.auth.AGENCIES_LIST, window.location.search);
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
				disabled={agencyDetailContext.flags.read_only || !agencyDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={tGlobal('save')}
				loading={agencyDetailContext.flags.saving}
				onClick={agencyDetailContext.actions.saveAgency}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
