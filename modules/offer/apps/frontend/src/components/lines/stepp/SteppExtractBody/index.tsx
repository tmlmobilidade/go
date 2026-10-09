/* * */

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { Section, Select } from '@tmlmobilidade/ui';

/* * */

export function SteppExtractBody() {
	//

	//
	// A. Setup variables

	const { options: agencyOptions } = useAgenciesData();

	//
	// b. Render components

	return (
		<Section>
			<Section gap="md">
				<Select
					data={agencyOptions}
					description="Selecione o operador para exportar os dados correspondentes"
					label="Selecionar operador"
					onChange={() => {}}
					placeholder="Selecionar operadores"
					value={agencyOptions[0].value}
					w="100%"
				/>
			</Section>
		</Section>
	);
}
