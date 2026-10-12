'use client';

import { useSteppExtractFormContext } from '@/components/lines/stepp/SteppExtractForm.context';
import { useSteppExtractLinesData } from '@/components/lines/stepp/use-stepp-extract-lines-data';
import { MultiSelect, SegmentedControl, StandardFormController, useStandardFormWatch } from '@tmlmobilidade/ui';

/* * */

export function SteppExtractLines() {
	//
	// A. Setup variables

	const { capabilities, form } = useSteppExtractFormContext();
	const agencyId = useStandardFormWatch({ control: form.control, name: 'agency_id' });
	const linesMode = useStandardFormWatch({ control: form.control, name: 'lines_mode' });
	const { error, isLoading, options } = useSteppExtractLinesData(agencyId);

	//
	// B. Render components

	return (
		<>
			<StandardFormController
				control={form.control}
				name="lines_mode"
				render={({ field }) => (
					<SegmentedControl
						disabled={!agencyId || !capabilities.editEnabled}
						value={field.value}
						data={[
							{ label: 'Todas as linhas', value: 'all' },
							{ label: 'Apenas estas linhas', value: 'include' },
							{ label: 'Todas exceto estas', value: 'exclude' },
						]}
						onChange={(value) => {
							field.onChange(value);
							form.setValue('lines_include', [], { shouldDirty: true, shouldValidate: true });
							form.setValue('lines_exclude', [], { shouldDirty: true, shouldValidate: true });
						}}
					/>
				)}
			/>
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
		</>
	);
}
