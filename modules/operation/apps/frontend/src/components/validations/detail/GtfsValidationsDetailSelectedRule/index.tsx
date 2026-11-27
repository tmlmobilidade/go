'use client';

import { GtfsValidationOutputMessage } from '@tmlmobilidade/go-types-gtfs-validator';
import { DataTable, type DataTableColumn, IdTag, Inline, Label, NoDataLabel, Pane, Section, SeverityTag, Text, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useGtfsValidationsDetailResultsContext } from '../GtfsValidationsDetailResults.context';
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
	// B. Handle actions

	const handleOpenDocumentation = () => {
		const baseUrl = 'https://go.tmlmobilidade.pt/reference/gtfs/validation-rules';
		const ruleDocumentationUrl = `${baseUrl}/${data.selected?.ruleId}`;
		window.open(ruleDocumentationUrl, '_blank');
	};

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
			<Toolbar key="header">
				<SeverityTag severity={data.selected?.result.severity} />
				<IdTag id={data.selected.ruleId} copyOnClick />
			</Toolbar>,
			<Section key="description" gap="sm">
				<Text>{data.selected.description}</Text>
				<Label size="sm" variant="primary" caps>
					<Inline onClick={handleOpenDocumentation} dotted>{t('gtfs_validations:detail.GtfsValidationsDetailSelectedRule.open_documentation')}</Inline>
				</Label>
			</Section>,
		]}
		>
			<DataTable
				columns={columns}
				records={data.selected?.result.messages}
				rowIdAccessor="message"
			/>
		</Pane>
	);
}
