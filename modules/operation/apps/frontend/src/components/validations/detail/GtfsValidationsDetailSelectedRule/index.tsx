'use client';

import { GtfsValidationOutputMessage } from '@tmlmobilidade/go-types-gtfs-validator';
import { Button, DataTable, DataTableColumn, Divider, NoDataLabel, Pane, Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useGtfsValidationsDetailResultsContext } from '../GtfsValidationsDetailResults.context';
import { GtfsValidationsDetailSelectedRuleHeader } from '../GtfsValidationsDetailSelectedRuleHeader';
import { translateValidationResult } from '../translate-validation-result';

/* * */

export function GtfsValidationsDetailSelectedRule() {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const { data } = useGtfsValidationsDetailResultsContext();

	const columns: DataTableColumn<GtfsValidationOutputMessage>[] = [
		{
			accessor: 'message',
			render: item => <Text>{translateValidationResult(i18n, 'message', data.selected?.ruleId, item.translation, item.message)}</Text>,
			title: t('gtfs_validations:detail.GtfsValidationsDetailResultMessages.message'),
			width: 400,
		},
		{
			accessor: 'rows',
			title: t('gtfs_validations:detail.GtfsValidationsDetailResultsList.columns.description'),
			width: 700,
		},
	];

	//
	// B. Render components

	if (!data.selected) {
		return (
			<Section alignItems="center" height="100%" justifyContent="center">
				<NoDataLabel text={t('gtfs_validations:detail.GtfsValidationsDetailSelectedRule.no_rule_selected')} />
			</Section>
		);
	}

	return (
		<Pane header={[
			<GtfsValidationsDetailSelectedRuleHeader key="header" />,
			// <Section key="header" gap="sm">
			// 	<code>{data.selected.ruleId}</code>
			// 	<Text>{data.selected.description}</Text>
			// 	<Button label="Documentation" onClick={() => null} />
			// </Section>,
		]}
		>

			<Divider />

			<DataTable
				columns={columns}
				records={data.selected?.result.messages}
				rowIdAccessor="message"
			/>

		</Pane>
	);
}
