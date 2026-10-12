'use client';

import { useLinesAgenciesData } from '@/components/lines/shared/use-agencies-data';
import { useSteppExtractFormContext } from '@/components/lines/stepp/SteppExtractForm.context';
import { useSteppExtractLinesData } from '@/components/lines/stepp/use-stepp-extract-lines-data';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { DateInput, Divider, Grid, MultiSelect, Section, SegmentedControl, Select, Spacer, StandardFormController, useStandardFormWatch } from '@tmlmobilidade/ui';

/* * */

export function SteppExtractBody() {
	//

	//
	// A. Setup variables

	const { isLoading, options: agencyOptions } = useLinesAgenciesData({
		permissions: { actions: ['extract-stepp'], scope: 'lines' },
	});
	const { capabilities, form } = useSteppExtractFormContext();
	const agencyId = useStandardFormWatch({ control: form.control, name: 'agency_id' });
	const linesMode = useStandardFormWatch({ control: form.control, name: 'lines_mode' });
	const { error, options } = useSteppExtractLinesData(agencyId);

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

			<Spacer />

			<StandardFormController
				control={form.control}
				name="lines_mode"
				render={({ field }) => (
					<SegmentedControl
						disabled={!capabilities.editEnabled || !agencyId}
						onBlur={field.onBlur}
						value={field.value}
						data={[
							{ label: 'Todas as linhas', value: 'all' },
							{ label: 'Apenas estas linhas', value: 'include' },
							{ label: 'Todas exceto estas', value: 'exclude' },
						]}
						onChange={(value) => {
							field.onChange(value);
							if (value !== 'exclude') form.setValue('lines_exclude', [], { shouldDirty: true, shouldValidate: true });
							if (value !== 'include') form.setValue('lines_include', [], { shouldDirty: true, shouldValidate: true });
						}}
						fullWidth
					/>
				)}
			/>

			<Divider />

			{linesMode !== 'all' && (
				<StandardFormController
					key={linesMode}
					control={form.control}
					name={linesMode === 'include' ? 'lines_include' : 'lines_exclude'}
					render={({ field, fieldState }) => (
						<MultiSelect
							data={options}
							description={linesMode === 'include' ? 'Apenas estas linhas serão exportadas.' : 'Todas as linhas serão exportadas, exceto estas.'}
							disabled={!agencyId || isLoading || !capabilities.editEnabled}
							error={fieldState.error?.message ?? error}
							onChange={field.onChange}
							placeholder="Selecionar linhas"
							value={field.value}
							w="100%"
						/>
					)}
				/>
			)}
		</Section>
	);
}
