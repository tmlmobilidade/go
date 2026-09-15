'use client';

import { useEventsLinesData } from '@/components/events/shared/use-events-lines-data';
import { type LinesMode } from '@tmlmobilidade/go-types-offer';
import { MultiSelect, Section, SegmentedControl, StandardFormController } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';

import { useEventsRulesCreateFormContext } from '../EventsRulesCreateForm.context';

/* * */

export function EventsRulesCreateLines() {
	//

	//
	// A. Setup variables

	const { eventData, form, values } = useEventsRulesCreateFormContext();

	const { data: allLinesData } = useEventsLinesData();

	//
	// B. Transform data

	const filteredLines = useMemo(() => {
		const agencyIdsSet = new Set(eventData.agency_ids);
		return allLinesData.filter(line => agencyIdsSet.has(line.agency_id));
	}, [allLinesData, eventData.agency_ids]);

	const linesOptions = useMemo(() => filteredLines.map(line => ({
		label: `${line.code} - ${line.name}`,
		value: line._id,
	})), [filteredLines]);

	//
	// C. Handle actions

	const handleChangeLinesMode = (value: string) => {
		form.setValue('lines_mode', value as LinesMode, { shouldDirty: true, shouldValidate: true });
		if (value !== 'include') form.setValue('lines_to_include', [], { shouldDirty: true, shouldValidate: true });
		if (value !== 'exclude') form.setValue('lines_to_exclude', [], { shouldDirty: true, shouldValidate: true });
	};

	// Prune the selected lines that are no longer available when the agencies or lines change.
	// Skip while the lines are not loaded yet to avoid clearing valid IDs during the initial load.
	useEffect(() => {
		if (filteredLines.length === 0) return;
		const allowedLineIds = new Set(filteredLines.map(line => line._id));
		const currentValues = form.getValues();
		if (currentValues.lines_mode === 'include') {
			const current = currentValues.lines_to_include ?? [];
			const next = current.filter(id => allowedLineIds.has(id));
			if (next.length !== current.length) form.setValue('lines_to_include', next, { shouldDirty: true, shouldValidate: true });
		}
		if (currentValues.lines_mode === 'exclude') {
			const current = currentValues.lines_to_exclude ?? [];
			const next = current.filter(id => allowedLineIds.has(id));
			if (next.length !== current.length) form.setValue('lines_to_exclude', next, { shouldDirty: true, shouldValidate: true });
		}
	}, [filteredLines, form]);

	//
	// D. Render components

	return (
		<Section gap="md">
			<SegmentedControl
				onChange={handleChangeLinesMode}
				value={values.lines_mode}
				data={[
					{ label: 'Aplica-se a todas as linhas', value: 'all' },
					{ label: 'Apenas estas linhas', value: 'include' },
					{ label: 'Todas exceto estas linhas', value: 'exclude' },
				]}
			/>
			{values.lines_mode === 'include' && (
				<StandardFormController
					control={form.control}
					name="lines_to_include"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={linesOptions}
							description="Apenas estas linhas serão afetadas."
							error={fieldState.error?.message}
							onBlur={field.onBlur}
							onChange={field.onChange}
							value={field.value ?? []}
						/>
					)}
				/>
			)}
			{values.lines_mode === 'exclude' && (
				<StandardFormController
					control={form.control}
					name="lines_to_exclude"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={linesOptions}
							description="Todas as linhas serão afetadas, exceto estas."
							error={fieldState.error?.message}
							onBlur={field.onBlur}
							onChange={field.onChange}
							value={field.value ?? []}
						/>
					)}
				/>
			)}
		</Section>
	);
}
