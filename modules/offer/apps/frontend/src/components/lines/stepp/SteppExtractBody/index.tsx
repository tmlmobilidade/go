/* * */

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { MultiSelect, Section } from '@tmlmobilidade/ui';

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
				<MultiSelect
					data={agencyOptions}
					description="Selecione um ou mais operadores para exportar os dados correspondentes"
					label="Selecionar operadores"
					placeholder="Selecionar operadores"
					value={[]}
					w="100%"
				/>
			</Section>
		</Section>
	);
}
