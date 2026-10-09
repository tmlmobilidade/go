'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useSteppExtractFormContext } from '@/components/lines/stepp/SteppExtractForm.context';
import { Section, Select, StandardFormController } from '@tmlmobilidade/ui';

/* * */

export function SteppExtractBody() {
	//

	//
	// A. Setup variables

	const { isLoading, options: agencyOptions } = useAgenciesData();
	const { capabilities, form } = useSteppExtractFormContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<StandardFormController
				control={form.control}
				name="agency_id"
				render={({ field, fieldState }) => (
					<Select
						data={agencyOptions}
						description="Selecione o operador para exportar os dados correspondentes"
						disabled={isLoading || !capabilities.editEnabled}
						error={fieldState.error?.message}
						label="Selecionar operador"
						onChange={value => field.onChange(value ?? '')}
						placeholder="Selecionar operador"
						value={field.value}
						w="100%"
						withAsterisk
					/>
				)}
			/>
		</Section>
	);
}
