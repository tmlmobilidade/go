'use client';

import { getRuleSeverity, ruleCatalogue, type RuleCatalogueEntry, type RuleGroup, type RuleSeverity, setRuleSeverity } from '@tmlmobilidade/go-types-gtfs-validator';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchField } from '../../../filters/text/SearchField';
import { Inline } from '../../display/Inline';
import { Grid } from '../../layout/Grid';
import { Section } from '../../layout/Section';
import { GtfsValidationRulesTable } from '../GtfsValidationRulesTable';
import { type GtfsValidationRulesEditorProps } from '../types';

/* * */

export function GtfsValidationRulesEditor({ onChange, readOnly, rules }: GtfsValidationRulesEditorProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [search, setSearch] = useState('');

	//
	// B. Transform data

	// The generated catalogue is already sorted by folder, then by rule id.
	const matchingEntries = useMemo(() => {
		const query = search.trim().toLowerCase();
		return ruleCatalogue.filter(entry => `${entry.group} ${entry.id} ${entry.output_ids?.join(' ') ?? ''}`.toLowerCase().includes(query));
	}, [search]);

	const groups = useMemo(() => {
		const result = new Map<RuleGroup, RuleCatalogueEntry[]>();

		for (const entry of matchingEntries) {
			const entries = result.get(entry.group);
			if (entries) entries.push(entry);
			else result.set(entry.group, [entry]);
		}

		return Array.from(result.entries());
	}, [matchingEntries]);

	//
	// C. Handle actions

	const handleGroupClick = (entries: RuleCatalogueEntry[]) => {
		if (readOnly) return;

		const editableEntries = entries.filter(entry => entry.editable);

		if (editableEntries.length === 0) return;

		// Set every editable rule to Error, or back to Ignore when they already all are.
		const allErrors = editableEntries.every(entry => getRuleSeverity(rules, entry) === 'error');
		const newSeverity: RuleSeverity = allErrors ? 'ignore' : 'error';

		onChange(editableEntries.reduce((current, entry) => setRuleSeverity(current, entry, newSeverity), rules));
	};

	//
	// D. Render components

	return (
		<Section gap="lg" padding="none">
			<SearchField onChange={setSearch} placeholder={t('shared:components.gtfsValidationRules.search')} value={search} />
			<Grid columns="a" gap="lg">
				{groups.map(([group, entries]) => (
					<GtfsValidationRulesTable
						key={group}
						entries={entries}
						onChange={onChange}
						readOnly={readOnly}
						rules={rules}
						title={<Inline onClick={() => handleGroupClick(entries)} dotted>{group}</Inline>}
					/>
				))}
			</Grid>
		</Section>
	);
}
