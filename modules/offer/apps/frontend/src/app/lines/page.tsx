'use client';

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';

/* * */

export default function Page() {
	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text="Selecione uma Linha" />
		</Surface>
	);
}
