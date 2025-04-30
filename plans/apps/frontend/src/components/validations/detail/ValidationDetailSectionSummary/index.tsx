/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { GTFSValidatorMessage } from '@tmlmobilidade/types';
import { Badge, Collapsible, DataTable, DataTableColumn, Divider, Label, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

export function ValidationDetailSectionSummary() {
	//

	//
	// A. Setup variables
	const validationDetailContext = useValidationDetailContext();

	const columns: DataTableColumn<GTFSValidatorMessage>[] = [
		{
			accessor: 'field',
			render: ({ field }) => {
				return <div>{field}</div>;
			},
			title: 'Campo',
			width: 200,
		},
		{
			accessor: 'fileName',
			render: ({ fileName }) => {
				return <div>{fileName}</div>;
			},
			title: 'Ficheiro',
			width: 200,
		},
		{
			accessor: 'severity',
			render: ({ severity }) => {
				return <div>{severity}</div>;
			},
			title: 'Severidade',
			width: 200,
		},
		{
			accessor: 'rows',
			render: ({ rows }) => {
				return <div>{rows.map(row => row.toString()).join(', ')}</div>;
			},
			title: 'Linhas',
			width: 200,
		},
		{
			accessor: 'message',
			render: ({ message }) => {
				return <div>{message}</div>;
			},
			title: 'Mensagem',
		},
	];

	//
	// B. Render components

	return (
		<Collapsible
			defaultOpen={true}
			description="O resumo da validação mostra o número de erros, avisos e informações encontrados no arquivo GTFS."
			title="Resumo da validação"
		>
			<Section gap="md">
				<Section flexDirection="row" gap="xs" padding="none">
					<Badge variant="danger">
						<div className={styles.badgeContent}>
							<IconAlertCircle />
							{validationDetailContext.data.form.getValues().summary?.total_errors}
						</div>
					</Badge>
					<Badge variant="warning">
						<div className={styles.badgeContent}>
							<IconAlertTriangle />
							{validationDetailContext.data.form.getValues().summary?.total_warnings}
						</div>
					</Badge>
					<Badge variant="info">
						<div className={styles.badgeContent}>
							<IconInfoCircle />
							{validationDetailContext.data.form.getValues().summary?.total_infos}
						</div>
					</Badge>
				</Section>
				<Divider />
				<DataTable
					columns={columns}
					records={validationDetailContext.data.form.getValues().summary?.messages ?? []}
				/>
			</Section>
		</Collapsible>
	);
}
