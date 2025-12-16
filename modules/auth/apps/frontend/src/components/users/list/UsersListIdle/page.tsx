'use client';

/* * */

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';

/* * */

export function UsersListIdle() {
	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text="Selecione um Utilizador" />
		</Surface>
	);
}
