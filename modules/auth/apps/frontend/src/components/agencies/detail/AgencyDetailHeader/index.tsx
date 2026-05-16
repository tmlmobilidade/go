'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { HasPermission, IdTag, keepUrlParams, LockButton, SaveButton, useContextFormWatch } from '@tmlmobilidade/ui';
import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function AgencyDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const agencyDetailContext = useAgencyDetailContext();

	const agencyNameValue = useContextFormWatch({ control: agencyDetailContext.form.instance.control, name: 'name' });

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.AGENCIES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={agencyDetailContext.data.id} copyOnClick />
			<Label size="lg" singleLine>{agencyNameValue}</Label>

			<Spacer />

			<SaveButton
				isDisabled={!agencyDetailContext.flags.canSave}
				isLoading={agencyDetailContext.flags.isSaving}
				onClick={agencyDetailContext.actions.save}
			/>

			<HasPermission
				action={PermissionCatalog.all.agencies.actions.lock}
				scope={PermissionCatalog.all.agencies.scope}
			>
				<LockButton
					isLoading={agencyDetailContext.flags.isLocking}
					isLocked={agencyDetailContext.data.agency?.is_locked}
					onClick={agencyDetailContext.actions.lock}
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
