'use client';

/* * */

import { SeverityTag } from '@/components/common/SeverityTag';
import { ValidationsDetailSectionResultCellRows } from '@/components/validations/detail/ValidationsDetailSectionResultCellRows';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { type GtfsValidationMessage } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn, Divider, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailSectionResult() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();
	const { t } = useTranslation();

	const columns: DataTableColumn<GtfsValidationMessage>[] = [
		{
			accessor: 'file_name',
			title: t('plans:validations.detail.ValidationsDetailSectionResult.table.columns.file_name.label'),
			width: 180,
		},
		{
			accessor: 'field',
			title: t('plans:validations.detail.ValidationsDetailSectionResult.table.columns.field.label'),
			width: 250,
		},
		{
			accessor: 'severity',
			render: item => <SeverityTag severity={item.severity} />,
			title: t('plans:validations.detail.ValidationsDetailSectionResult.table.columns.severity.label'),
			width: 100,
		},
		{
			accessor: 'message',
			title: t('plans:validations.detail.ValidationsDetailSectionResult.table.columns.message.label'),
			width: 500,
		},
		{
			accessor: 'rows',
			render: item => <ValidationsDetailSectionResultCellRows rows={item.rows} />,
			title: t('plans:validations.detail.ValidationsDetailSectionResult.table.columns.rows.label'),
			width: 600,
		},
	];

	//
	// B. Transform data

	const errorCountLabel = useMemo(() => {
		const totalErrors = validationsDetailContext.data.validation?.summary?.total_errors ?? 0;
		return totalErrors === 1 ? `${totalErrors} Erro` : `${totalErrors} Erros`;
	}, [validationsDetailContext.data.validation]);

	const warningCountLabel = useMemo(() => {
		const totalWarnings = validationsDetailContext.data.validation?.summary?.total_warnings ?? 0;
		return totalWarnings === 1 ? `${totalWarnings} Aviso` : `${totalWarnings} Avisos`;
	}, [validationsDetailContext.data.validation]);

	const filteredMessages = useMemo(() => {
		const messages = validationsDetailContext.data.validation?.summary?.messages ?? [];
		return messages.filter(message => message.severity !== 'ignore');
	}, [validationsDetailContext.data.validation]);

	//
	// C. Render components

	if (validationsDetailContext.data.validation?.processing_status !== 'complete' && validationsDetailContext.data.validation?.processing_status !== 'error') {
		return null;
	}

	return (
		<Collapsible
			defaultOpen={true}
			description={t('plans:validations.detail.ValidationsDetailSectionResult.description')}
			title={t('plans:validations.detail.ValidationsDetailSectionResult.title')}
		>
			<Section flexDirection="row" gap="md">
				<SeverityTag label={errorCountLabel} severity="error" />
				<SeverityTag label={warningCountLabel} severity="warning" />
			</Section>
			<Divider />
			<div style={{ overflowX: 'auto' }}>
				<DataTable columns={columns} records={filteredMessages} />
			</div>
		</Collapsible>
	);

	//
}
