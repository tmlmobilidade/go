'use client';

/* * */

import { SeverityTag } from '@/components/common/SeverityTag';
import { ValidationsDetailSectionResultCellRows } from '@/components/validations/detail/ValidationsDetailSectionResultCellRows';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { getGtfsScheduleDocUrl } from '@/lib/gtfs-schedule-doc-url';
import { type GtfsValidationMessage } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn, Divider, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ValidationsDetailSectionResult() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();

	const columns: DataTableColumn<GtfsValidationMessage>[] = [
		{
			accessor: 'file_name',
			title: 'Ficheiro',
			width: 180,
		},
		{
			accessor: 'field',
			// eslint-disable-next-line @stylistic/arrow-parens
			render: item => {
				const docUrl = getGtfsScheduleDocUrl(item.file_name);
				const linkable = (item.severity === 'error' || item.severity === 'warning' || item.severity === 'forbidden') && docUrl !== null;
				if (linkable) {
					return (
						<a href={docUrl} rel="noopener noreferrer" target="_blank">
							{item.field}
						</a>
					);
				}
				return item.field;
			},
			title: 'Campo',
			width: 250,
		},
		// {
		// 	accessor: 'rule_id',
		// 	title: 'ID da Regra',
		// 	width: 200,
		// },
		{
			accessor: 'severity',
			render: item => <SeverityTag severity={item.severity} />,
			title: 'Severidade',
			width: 100,
		},
		{
			accessor: 'message',
			title: 'Mensagem',
			width: 500,
		},
		{
			accessor: 'rows',
			render: item => <ValidationsDetailSectionResultCellRows rows={item.rows} />,
			title: 'Linhas do Ficheiro',
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
			description="Informações, avisos e erros encontrados no arquivo GTFS"
			title="Resultado da Validação"
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
