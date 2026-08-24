'use client';

import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { useSchoolCreatePublish } from '../use-schools-create-publish';

/* * */

export function SchoolCreateFooter() {
	//

	//
	// A. Setup variables

	const { isLoading: isCreating, publish } = useSchoolCreatePublish();

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
