'use client';

/* * */

import { SeverityTag } from '@/components/common/SeverityTag';
import { ValidationDetailSectionResultCellRows } from '@/components/validations/detail/ValidationDetailSectionResultCellRows';
import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { type GTFSValidatorMessage } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn, Divider, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ValidationDetailSectionResult() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();

	const columns: DataTableColumn<GTFSValidatorMessage>[] = [
		{
			accessor: 'file_name',
			title: 'Ficheiro',
			width: 180,
		},
		{
			accessor: 'field',
			title: 'Campo',
			width: 250,
		},
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
			render: item => <ValidationDetailSectionResultCellRows rows={item.rows} />,
			title: 'Linhas do Ficheiro',
			width: 400,
		},
	];

	//
	// B. Transform data

	const errorCountLabel = useMemo(() => {
		const totalErrors = validationDetailContext.data.form.getValues().summary?.total_errors ?? 0;
		return totalErrors > 1 ? `${totalErrors} Erros` : `${totalErrors} Erro`;
	}, [validationDetailContext.data.form]);

	const warningCountLabel = useMemo(() => {
		const totalWarnings = validationDetailContext.data.form.getValues().summary?.total_warnings ?? 0;
		return totalWarnings > 1 ? `${totalWarnings} Avisos` : `${totalWarnings} Aviso`;
	}, [validationDetailContext.data.form]);

	const filteredMessages = useMemo(() => {
		const messages = validationDetailContext.data.form.getValues().summary?.messages ?? [];
		return messages.filter(message => message.severity !== 'ignore');
	}, [validationDetailContext.data.form]);

	//
	// C. Render components

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
