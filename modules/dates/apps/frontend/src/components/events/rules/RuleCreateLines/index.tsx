'use client';

/* * */

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { LinesMode } from '@tmlmobilidade/types';
import { MultiSelect, Section, SegmentedControl } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';

/* * */

export function RuleCreateLines() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();
	const linesContext = useLinesContext();

	const agencyIds = createRuleContext.data.eventData.agency_ids || [];
	const filteredLines = linesContext.data.raw.filter(line => agencyIds.includes(line.agency_id));

	const linesOptions = useMemo(() => filteredLines.map(line => ({
		label: `${line.code} - ${line.name}`,
		value: line._id,
	})), [filteredLines, agencyIds]);

	// Prune lines_to_include/exclude when agency_ids or available lines change
	useEffect(() => {
		// Skip if lines data is not yet loaded to avoid clearing valid IDs during initial load
		if (!filteredLines || filteredLines.length === 0) return;

		const form = createRuleContext.data.form;

		const allowed = new Set(filteredLines.map(l => l._id));

		if (form.values.lines_mode === 'include') {
			const cur = form.values.lines_to_include ?? [];
			const next = cur.filter(id => allowed.has(id));
			if (next.length !== cur.length) form.setFieldValue('lines_to_include', next);
		}

		if (form.values.lines_mode === 'exclude') {
			const cur = form.values.lines_to_exclude ?? [];
			const next = cur.filter(id => allowed.has(id));
			if (next.length !== cur.length) form.setFieldValue('lines_to_exclude', next);
		}
	}, [filteredLines, createRuleContext.data.eventData.agency_ids]);

	//
	// B. Render components

	return (
		<Section gap="md">
			<SegmentedControl
				key={createRuleContext.data.form.key('lines_mode')}
				value={createRuleContext.data.form.values.lines_mode}
				data={[
					{ label: 'Aplica-se a todas as linhas', value: 'all' },
					{ label: 'Apenas estas linhas', value: 'include' },
					{ label: 'Todas exceto estas linhas', value: 'exclude' },
				]}
				onChange={(value) => {
					createRuleContext.data.form.setFieldValue('lines_mode', value as LinesMode);

					if (value !== 'include') createRuleContext.data.form.setFieldValue('lines_to_include', []);
					if (value !== 'exclude') createRuleContext.data.form.setFieldValue('lines_to_exclude', []);
				}}
			/>

			{createRuleContext.data.form.values.lines_mode === 'include' && (
				<MultiSelect
					key={createRuleContext.data.form.key('lines_to_include')}
					data={linesOptions}
					description="Apenas estas linhas serão afetadas."
					w="100%"
					{...createRuleContext.data.form.getInputProps('lines_to_include')}
				/>
			)}

			{createRuleContext.data.form.values.lines_mode === 'exclude' && (
				<MultiSelect
					key={createRuleContext.data.form.key('lines_to_exclude')}
					data={linesOptions}
					description="Todas as linhas serão afetadas, exceto estas."
					w="100%"
					{...createRuleContext.data.form.getInputProps('lines_to_exclude')}
				/>
			)}

		</Section>
	);

	//
}
