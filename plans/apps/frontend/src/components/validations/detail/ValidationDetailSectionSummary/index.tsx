/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { IconAlertCircle, IconAlertTriangle, IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { GTFSValidatorMessage } from '@tmlmobilidade/types';
import { Badge, Collapsible, DataTable, DataTableColumn, Description, Divider, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

export function ValidationDetailSectionSummary() {
	//

	//
	// A. Setup variables
	const validationDetailContext = useValidationDetailContext();

	const columns: DataTableColumn<GTFSValidatorMessage>[] = [
		{
			accessor: 'file_name',
			render: ({ file_name }) => {
				return <div>{file_name}</div>;
			},
			title: 'Ficheiro',
			width: 200,
		},
		{
			accessor: 'field',
			render: ({ field }) => {
				return <div>{field}</div>;
			},
			title: 'Campo',
			width: 200,
		},
		{
			accessor: 'severity',
			render: ({ severity }) => {
				return (
					<SeverityBadge severity={severity} />
				);
			},
			title: 'Severidade',
			width: 200,
		},
		{
			accessor: 'rows',
			render: ({ rows }) => {
				return (
					<RowsCell rows={rows} />
				);
			},
			title: 'Linhas do Ficheiro',
			width: 400,
		},
		{
			accessor: 'message',
			render: ({ message }) => {
				return <>{message}</>;
			},
			title: 'Mensagem',
			width: 500,
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
			<div className={styles.container}>
				<Section flexDirection="row" gap="xs" padding="none">
					<SeverityBadge label={validationDetailContext.data.form.getValues().summary?.total_errors?.toString()} severity="error" />
					<SeverityBadge label={validationDetailContext.data.form.getValues().summary?.total_warnings?.toString()} severity="warning" />
				</Section>
				<Divider />
				<DataTable
					columns={columns}
					records={validationDetailContext.data.form.getValues().summary?.messages ?? []}
				/>
			</div>
		</Collapsible>
	);
}

interface SeverityConfig {
	icon: React.ReactNode
	label: string
	variant: 'active' | 'danger' | 'disabled' | 'info' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning'
}

function SeverityBadge({ label, severity }: { label?: string, severity: 'error' | 'ignore' | 'warning' }) {
	const severityConfig: Record<string, SeverityConfig> = {
		error: {
			icon: <IconAlertCircle />,
			label: 'Erro',
			variant: 'danger',
		},
		ignore: {
			icon: <IconInfoCircle />,
			label: 'Informação',
			variant: 'info',
		},
		warning: {
			icon: <IconAlertTriangle />,
			label: 'Aviso',
			variant: 'warning',
		},
	};

	return (
		<Badge variant={severityConfig[severity].variant}>
			<div className={styles.badgeContent}>{severityConfig[severity].icon}{label ?? severityConfig[severity].label}</div>
		</Badge>
	);
}

function RowsCell({ rows }: { rows: number[] }) {
	const MAX_ROWS = 10;

	return (
		<div className={styles.rowsCell}>
			{rows.slice(0, MAX_ROWS).map((row) => {
				return <Badge key={row} variant="muted">{row}</Badge>;
			})}
			{rows.length > MAX_ROWS && (
				<Description>
					<div className={styles.rowsCellMore}>
						<IconPlus size={16} />
						{rows.length - MAX_ROWS} linhas
					</div>
				</Description>
			)}
		</div>
	);
}
