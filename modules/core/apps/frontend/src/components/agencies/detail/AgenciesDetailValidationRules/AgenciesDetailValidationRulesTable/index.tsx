'use client';

import { Surface, Table } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { AgenciesDetailValidationRuleRow } from '../AgenciesDetailValidationRuleRow';
import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';

/* * */

export function AgenciesDetailValidationRulesTable() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, data, filters } = useAgenciesDetailValidationRulesContext();

	//
	// B. Render components

	return (
		<Surface className={styles.scroll} overflow="auto" variant="bordered">
			<Table className={styles.table}>
				<Table.Thead className={styles.header}>
					<Table.Tr>
						<Table.Th scope="col">{t('agencies:detail.AgenciesDetailValidationRulesTable.rule')}</Table.Th>
						<Table.Th scope="col">{t('agencies:detail.AgenciesDetailValidationRulesTable.severity')}</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{data.entries.length === 0 && (
						<Table.Tr><Table.Td colSpan={2}>{t('agencies:detail.AgenciesDetailValidationRulesTable.empty')}</Table.Td></Table.Tr>
					)}
					{data.entries.map(entry => (
						<AgenciesDetailValidationRuleRow
							key={entry.ruleId}
							entry={entry}
							isSelected={entry.ruleId === data.selectedEntry?.ruleId}
							onSelect={actions.selectRule}
							severityLabel={filters.getSeverityLabel(entry.severity ?? 'unconfigured')}
						/>
					))}
				</Table.Tbody>
			</Table>
		</Surface>
	);
}
