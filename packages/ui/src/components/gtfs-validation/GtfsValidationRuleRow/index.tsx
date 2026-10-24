'use client';

import { IconChevronRight } from '@tabler/icons-react';
import { type GtfsValidatorRuleId } from '@tmlmobilidade/go-types-gtfs-validator';
import { type KeyboardEvent, useState } from 'react';

import styles from './styles.module.css';

import { Inline } from '../../display/Inline';
import { Table } from '../../display/Table';
import { Collapse } from '../../layout/Collapse';
import { GtfsValidationRuleSettings, hasRuleSettings } from '../GtfsValidationRuleSettings';
import { GtfsValidationRuleSeverity } from '../GtfsValidationRuleSeverity';
import { type GtfsValidationRulesEditorProps } from '../types';

/* * */

interface GtfsValidationRuleRowProps extends GtfsValidationRulesEditorProps {
	rule: GtfsValidatorRuleId
}

/* * */

export function GtfsValidationRuleRow({ onChange, readOnly, rule, rules }: GtfsValidationRuleRowProps) {
	//

	//
	// A. Setup variables

	const [expanded, setExpanded] = useState(false);
	const expandable = hasRuleSettings(rules, rule, readOnly);

	//
	// B. Handle actions

	const handleToggle = () => setExpanded(current => !current);

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		handleToggle();
	};

	//
	// C. Render components

	return (
		<>
			<Table.Tr>
				<Table.Td className={styles.rule}>
					{expandable
						? (
							<Inline aria-expanded={expanded} className={styles.toggle} onClick={handleToggle} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
								<IconChevronRight className={styles.chevron} data-expanded={expanded} size={14} stroke={2.5} />
								{rule}
							</Inline>
						)
						: rule}
				</Table.Td>
				<Table.Td><GtfsValidationRuleSeverity onChange={onChange} readOnly={readOnly} rule={rule} rules={rules} /></Table.Td>
			</Table.Tr>
			{expandable && (
				<Table.Tr className={styles.settingsRow} data-expanded={expanded}>
					<Table.Td colSpan={2} p={0}>
						{/* Unmounted while collapsed, so closed rules stay cheap. */}
						<Collapse expanded={expanded} keepMounted={false}>
							<div className={styles.settings}>
								<GtfsValidationRuleSettings onChange={onChange} readOnly={readOnly} rule={rule} rules={rules} />
							</div>
						</Collapse>
					</Table.Td>
				</Table.Tr>
			)}
		</>
	);
}
