'use client';

import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Table } from '../../display/Table';
import { Divider } from '../../layout/Divider';
import { Section } from '../../layout/Section';
import { Surface } from '../../layout/Surface';
import { GtfsValidationRuleRow } from '../GtfsValidationRuleRow';
import { type GtfsValidationRulesTableProps } from '../types';

/* * */

export function GtfsValidationRulesTable({ entries, onChange, readOnly, rules, title }: GtfsValidationRulesTableProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Surface variant="bordered">
			<Section padding="none">
				<Section>{title}</Section>
				<Divider />
				<Table className={styles.table} highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('shared:components.gtfsValidationRules.rule')}</Table.Th>
							<Table.Th w={380}>{t('shared:components.gtfsValidationRules.severity')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{entries.length === 0 && <Table.Tr><Table.Td colSpan={2}>{t('shared:components.gtfsValidationRules.empty')}</Table.Td></Table.Tr>}
						{entries.map(rule => <GtfsValidationRuleRow key={rule} onChange={onChange} readOnly={readOnly} rule={rule} rules={rules} />)}
					</Table.Tbody>
				</Table>
			</Section>
		</Surface>
	);
}
