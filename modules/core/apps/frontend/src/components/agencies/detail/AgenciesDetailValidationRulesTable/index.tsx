'use client';

import { getRuleSeverity, getSavedRuleSeverity, ruleCatalogue, type RuleCatalogueEntry, type RuleGroup, ruleSeverities, type RuleSeverity, setRuleSeverity, type ValidationRulesInput } from '@tmlmobilidade/go-types-gtfs-validator';
import { Divider, Grid, Inline, Label, SearchField, Section, SegmentedControl, Surface, Table } from '@tmlmobilidade/ui';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface AgenciesDetailValidationRulesTableProps {
	onChange: (rules: ValidationRulesInput) => void
	readOnly: boolean
	rules: ValidationRulesInput
}

/* * */

export function AgenciesDetailValidationRulesTable({ onChange, readOnly, rules }: AgenciesDetailValidationRulesTableProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [search, setSearch] = useState('');
	const severityOptions = ruleSeverities.map(value => ({ label: t(`default:agencies.detail.ValidationRules.severities.${value}`), value }));

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

	// Editable rules with nothing saved yet, listed apart so they are not missed.
	// A rule deliberately set to Ignore is configured, so it stays out of here.
	const unconfiguredEntries = useMemo(() => {
		return matchingEntries.filter(entry => entry.editable && getSavedRuleSeverity(rules, entry) === undefined);
	}, [matchingEntries, rules]);

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

	// A rule with no saved severity has no segment selected: an unmatched value
	// leaves every segment inactive, so it does not read as a deliberate Ignore.
	const renderSeverity = (entry: RuleCatalogueEntry) => entry.editable ? (
		<SegmentedControl
			aria-label={`${entry.id}: ${t('default:agencies.detail.ValidationRules.severity')}`}
			data={severityOptions}
			onChange={value => onChange(setRuleSeverity(rules, entry, value as RuleSeverity))}
			readOnly={readOnly}
			size="xs"
			value={getSavedRuleSeverity(rules, entry) ?? ''}
		/>
	) : (
		<Label>{(entry.severities ?? [entry.severity]).map(value => t(`default:agencies.detail.ValidationRules.severities.${value}`)).join(' / ')}</Label>
	);

	const renderCard = (title: ReactNode, entries: RuleCatalogueEntry[], showGroup: boolean) => (
		<Surface variant="bordered">
			<Section padding="none">
				<Section>{title}</Section>
				<Divider />
				<Table highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							{showGroup && <Table.Th>{t('default:agencies.detail.ValidationRules.group')}</Table.Th>}
							<Table.Th>{t('default:agencies.detail.ValidationRules.rule')}</Table.Th>
							<Table.Th w={380}>{t('default:agencies.detail.ValidationRules.severity')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{entries.map(entry => (
							<Table.Tr key={`${entry.group}.${entry.id}`}>
								{showGroup && <Table.Td>{entry.group}</Table.Td>}
								<Table.Td style={{ overflowWrap: 'anywhere' }}>{entry.id}</Table.Td>
								<Table.Td>{renderSeverity(entry)}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</Section>
		</Surface>
	);

	return (
		<Section gap="lg" padding="none">
			<SearchField onChange={setSearch} placeholder={t('default:agencies.detail.ValidationRules.search')} value={search} />
			{unconfiguredEntries.length > 0 && renderCard(t('default:agencies.detail.ValidationRules.unconfigured.title'), unconfiguredEntries, true)}
			<Grid columns="a" gap="lg">
				{groups.map(([group, entries]) => (
					<Fragment key={group}>
						{renderCard(<Inline onClick={() => handleGroupClick(entries)} dotted>{group}</Inline>, entries, false)}
					</Fragment>
				))}
			</Grid>
		</Section>
	);
}
