'use client';

import { GtfsValidatorRuleIdValues } from '@tmlmobilidade/go-types-gtfs-validator';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchField } from '../../../filters/text/SearchField';
import { Inline } from '../../display/Inline';
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

	const matchingIds = useMemo(() => {
		const query = search.trim().toLowerCase();
		return GtfsValidatorRuleIdValues.filter(id => id.includes(query));
	}, [search]);

	//
	// C. Handle actions

	const handleAllClick = () => {
		if (readOnly) return;
		if (!matchingIds.length) return;
		const severity = matchingIds.every(id => rules[id]?.severity === 'error') ? 'ignore' : 'error';
		const updated: GtfsValidationRulesEditorProps['rules'] = { ...rules };
		for (const id of matchingIds) updated[id] = { depends_on: [], ...rules[id], severity };
		onChange(updated);
	};

	//
	// D. Render components

	return (
		<Section gap="lg" padding="none">
			<SearchField onChange={setSearch} placeholder={t('shared:components.gtfsValidationRules.search')} value={search} />
			<GtfsValidationRulesTable
				entries={matchingIds}
				onChange={onChange}
				readOnly={readOnly}
				rules={rules}
				title={<Inline dotted={!readOnly} onClick={readOnly ? undefined : handleAllClick}>{t('shared:components.gtfsValidationRules.allRules')}</Inline>}
			/>
		</Section>
	);
}
