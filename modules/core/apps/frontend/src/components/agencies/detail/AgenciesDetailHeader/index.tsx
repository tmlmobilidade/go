'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { IdTag, keepUrlParams, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';
import { useAgenciesDetailAgencyId } from '../use-agencies-detail-agency-id';

/* * */

export function AgenciesDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { agencyId } = useAgenciesDetailAgencyId();

	const { actions, capabilities, form, status } = useAgenciesDetailFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.core.AGENCIES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={agencyId} copyOnClick />
			<Label size="lg" singleLine>{nameValue}</Label>

			<Spacer />

			<UpdateButton
				isDisabled={!capabilities.updateEnabled}
				isLoading={status.isUpdating}
				onClick={actions.update}
			/>

		</Toolbar>
	);
}
