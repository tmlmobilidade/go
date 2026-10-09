'use client';

import { useTranslation } from 'react-i18next';

import { Table } from '../../display/Table';
import { Divider } from '../../layout/Divider';
import { Section } from '../../layout/Section';
import { Surface } from '../../layout/Surface';
import { GtfsValidationRuleRow } from '../GtfsValidationRuleRow';
import { type GtfsValidationRulesTableProps } from '../types';

/* * */

export function GtfsValidationRulesTable({ entries, onChange, readOnly, rules, showGroup = false, title }: GtfsValidationRulesTableProps) {
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
				<Table highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							{showGroup && <Table.Th>{t('shared:components.gtfsValidationRules.group')}</Table.Th>}
							<Table.Th>{t('shared:components.gtfsValidationRules.rule')}</Table.Th>
							<Table.Th w={380}>{t('shared:components.gtfsValidationRules.severity')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{entries.map(rule => <GtfsValidationRuleRow key={`${rule.group}.${rule.id}`} onChange={onChange} readOnly={readOnly} rule={rule} rules={rules} showGroup={showGroup} />)}
					</Table.Tbody>
				</Table>
			</Section>
		</Surface>
	);
}
