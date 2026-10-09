'use client';

import { useLinesAgenciesData } from '@/components/lines/shared/use-agencies-data';
import { useSteppExtractFormContext } from '@/components/lines/stepp/SteppExtractForm.context';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { DateInput, Grid, Section, Select, StandardFormController } from '@tmlmobilidade/ui';

/* * */

export function SteppExtractBody() {
	//

	//
	// A. Setup variables

	const { isLoading, options: agencyOptions } = useLinesAgenciesData({
		permissions: { actions: ['extract-stepp'], scope: 'lines' },
	});
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
			<Grid columns="ab" gap="md">
				<StandardFormController
					control={form.control}
					name="start_date"
					render={({ field, fieldState }) => (
						<DateInput
							description="O GTFS carregado a partir desta data"
							error={fieldState.error?.message}
							label="Primeira data do calendário"
							onChange={value => field.onChange(value != null ? String(value) : '')}
							placeholder="YYYYMMDD"
							readOnly={!capabilities.editEnabled}
							value={field.value ? Number(field.value) as OperationalDateInt : null}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="end_date"
					render={({ field, fieldState }) => (
						<DateInput
							description="O GTFS carregado até esta data"
							error={fieldState.error?.message}
							label="Última data do calendário"
							onChange={value => field.onChange(value != null ? String(value) : '')}
							placeholder="YYYYMMDD"
							readOnly={!capabilities.editEnabled}
							value={field.value ? Number(field.value) as OperationalDateInt : null}
						/>
					)}
				/>
			</Grid>
		</Section>
	);
}
