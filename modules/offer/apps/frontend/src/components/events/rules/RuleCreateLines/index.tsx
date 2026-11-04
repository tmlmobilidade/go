'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { type LinesMode } from '@tmlmobilidade/go-types-offer';
import { MultiSelect, Section, SegmentedControl } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateLines() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const createRuleContext = useRuleCreateContext();
	const linesContext = useLinesContext();

	const agencyIds = createRuleContext.eventData.agency_ids || [];
	const filteredLines = linesContext.data.raw.filter(line => agencyIds.includes(line.agency_id));

	const linesOptions = useMemo(() => filteredLines.map(line => ({
		label: `${line.code} - ${line.name}`,
		value: line._id,
	})), [filteredLines]);

	// Prune lines_to_include/exclude when agency_ids or available lines change
	useEffect(() => {
		// Skip if lines data is not yet loaded to avoid clearing valid IDs during initial load
		if (!filteredLines || filteredLines.length === 0) return;

		const form = createRuleContext.form;
		const values = form.getValues();

		const allowed = new Set(filteredLines.map(l => l._id));

		if (values.lines_mode === 'include') {
			const cur = values.lines_to_include ?? [];
			const next = cur.filter(id => allowed.has(id));
			if (next.length !== cur.length) form.setValue('lines_to_include', next);
		}

		if (values.lines_mode === 'exclude') {
			const cur = values.lines_to_exclude ?? [];
			const next = cur.filter(id => allowed.has(id));
			if (next.length !== cur.length) form.setValue('lines_to_exclude', next);
		}
	}, [filteredLines, createRuleContext.eventData.agency_ids, createRuleContext.form]);

	//
	// B. Render components

	return (
		<Section gap="md">
			<SegmentedControl
				value={createRuleContext.values.lines_mode}
				data={[
					{ label: t('default:events.ruleEditor.allLines'), value: 'all' },
					{ label: t('default:events.ruleEditor.includeLines'), value: 'include' },
					{ label: t('default:events.ruleEditor.excludeLines'), value: 'exclude' },
				]}
				onChange={(value) => {
					createRuleContext.form.setValue('lines_mode', value as LinesMode);

					if (value !== 'include') createRuleContext.form.setValue('lines_to_include', []);
					if (value !== 'exclude') createRuleContext.form.setValue('lines_to_exclude', []);
				}}
			/>

			{createRuleContext.values.lines_mode === 'include' && (
				<MultiSelect
					data={linesOptions}
					description={t('default:events.ruleEditor.includeLinesDescription')}
					onChange={value => createRuleContext.form.setValue('lines_to_include', value)}
					value={createRuleContext.values.lines_to_include ?? []}
					w="100%"
				/>
			)}

			{createRuleContext.values.lines_mode === 'exclude' && (
				<MultiSelect
					data={linesOptions}
					description={t('default:events.ruleEditor.excludeLinesDescription')}
					onChange={value => createRuleContext.form.setValue('lines_to_exclude', value)}
					value={createRuleContext.values.lines_to_exclude ?? []}
					w="100%"
				/>
			)}

		</Section>
	);

	//
}
