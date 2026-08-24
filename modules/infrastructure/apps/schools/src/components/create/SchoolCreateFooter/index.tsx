'use client';

import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { type UseSchoolCreateFormReturnType } from '../use-schools-create-form';
import { useSchoolCreatePublish } from '../use-schools-create-publish';

/* * */

interface SchoolCreateFooterProps {
	form: UseSchoolCreateFormReturnType['form']
	unblock: UseSchoolCreateFormReturnType['unblock']
}

/* * */

export function SchoolCreateFooter({ form, unblock }: SchoolCreateFooterProps) {
	//

	//
	// A. Setup variables

	const { isLoading: isCreating, publish } = useSchoolCreatePublish({ form, unblock });

	//
	// B. Render components

	return (
		<Toolbar>

			<Spacer />

			<Button
				label="Criar escola"
				loading={isCreating}
				onClick={publish}
			/>
		</Toolbar>
	);
}
