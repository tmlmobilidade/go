'use client';

/* * */

import { NoDataLabel, Surface } from '@go/ui';

/* * */

export default function Page() {
	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text="Selecione uma Organização" />
		</Surface>
	);
}
