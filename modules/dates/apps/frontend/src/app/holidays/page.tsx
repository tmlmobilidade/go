/* * */

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';

/* * */

export default async function Page() {
	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text="Selecione um Feriado" />
		</Surface>
	);
}
