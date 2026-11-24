'use client';

import { type GtfsValidatorRuleId } from '@tmlmobilidade/go-types-gtfs-validator';
import { Table } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { type AgenciesDetailValidationRuleEntry } from '../types';

/* * */

interface AgenciesDetailValidationRuleRowProps {
	entry: AgenciesDetailValidationRuleEntry
	isSelected: boolean
	onSelect: (ruleId: GtfsValidatorRuleId) => void
	severityLabel: string
}

/* * */

export function AgenciesDetailValidationRuleRow({ entry, isSelected, onSelect, severityLabel }: AgenciesDetailValidationRuleRowProps) {
	return (
		<Table.Tr className={styles.row} data-selected={isSelected}>
			<Table.Td>
				<button
					aria-pressed={isSelected}
					className={styles.rule}
					onClick={() => onSelect(entry.ruleId)}
					type="button"
				>
					{entry.ruleId}
				</button>
			</Table.Td>
			<Table.Td>
				<span className={styles.severity} data-severity={entry.severity ?? 'unconfigured'}>{severityLabel}</span>
			</Table.Td>
		</Table.Tr>
	);
}
