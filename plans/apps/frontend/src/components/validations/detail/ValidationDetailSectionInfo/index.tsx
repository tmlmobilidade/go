/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Collapsible, Combobox, Section } from '@tmlmobilidade/ui';

/* * */

export function ValidationDetailSectionInfo() {
	//

	//
	// A. Setup variables
	const validationDetailContext = useValidationDetailContext();

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações gerais sobre o validação, como operador, data de vigência, etc."
			title="Informação do validação"
		>
			<Section gap="md">
				<Combobox
					aria-label="Agência"
					data={validationDetailContext.data.agencies}
					label="Agência"
					fullWidth
					{...validationDetailContext.data.form.getInputProps('agency_id')}
				/>
			</Section>
		</Collapsible>
	);
}
