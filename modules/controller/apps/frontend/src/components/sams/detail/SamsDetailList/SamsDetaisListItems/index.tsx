/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { formatUnixTimestampToDateString } from '@/lib/utils';
import { SamAnalysis } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, IdTag, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

const hasRangeOverlap = (analysis: SamAnalysis, filterStart: number, filterEnd: number): boolean => {
	const analysisStart = analysis.start_time;
	const analysisEnd = analysis.end_time;
	if (!Number.isFinite(analysisStart) || !Number.isFinite(analysisEnd)) return false;
	const normalizedAnalysisStart = Math.min(analysisStart, analysisEnd);
	const normalizedAnalysisEnd = Math.max(analysisStart, analysisEnd);
	const normalizedFilterStart = Math.min(filterStart, filterEnd);
	const normalizedFilterEnd = Math.max(filterStart, filterEnd);
	return normalizedAnalysisStart <= normalizedFilterEnd && normalizedAnalysisEnd >= normalizedFilterStart;
};

/* * */

export function SamsDetaisListItems() {
	//

	//
	// A. Setup variables

	const samDetailContext = useSamsDetailContext();
	const filterStart = samDetailContext.ui.analysisFilterStartTime;
	const filterEnd = samDetailContext.ui.analysisFilterEndTime;
	const hasActiveFilter = filterStart != null && filterEnd != null;

	//
	// B. Render component

	const records = useMemo(() => {
		const analysisRecords = samDetailContext.data.sam?.analysis ?? [];
		if (!hasActiveFilter) return analysisRecords;
		if (filterStart == null || filterEnd == null) return analysisRecords;
		return analysisRecords.filter(analysis => hasRangeOverlap(analysis, filterStart, filterEnd));
	}, [hasActiveFilter, filterStart, filterEnd, samDetailContext.data.sam?.analysis]);

	const columns = useMemo(() => {
		return [
			{
				accessor: 'start_time',
				render: item => <Tag label={formatUnixTimestampToDateString(item.start_time)} />,
				title: 'Data de início',
				width: 200,
			},
			{
				accessor: 'end_time',
				render: item => <Tag label={formatUnixTimestampToDateString(item.end_time)} />,
				title: 'Data de fim',
				width: 200,
			},
			{
				accessor: 'device_id',
				render: item => <IdTag id={item.device_id ?? '-'} copyOnClick />,
				title: 'Device ID',
				width: 250,
			},
			{
				accessor: 'vehicle_id',
				render: item => <IdTag id={item.vehicle_id ?? '-'} copyOnClick />,
				title: 'Vehicle ID',
				width: 100,
			},
			{
				accessor: 'apex_version',
				render: item => <Tag label={item.apex_version ?? '-'} />,
				title: 'Versão APEX',
				width: 100,
			},
			{
				accessor: 'transactions_expected',
				render: item => <Tag label={item.transactions_expected?.toString() ?? '-'} />,
				title: 'Transações esperadas',
				width: 200,
			},
			{
				accessor: 'transactions_found',
				render: item => <Tag label={item.transactions_found?.toString() ?? '-'} />,
				title: 'Transações encontradas',
				width: 200,
			},
			{
				accessor: 'transactions_missing',
				render: item => <Tag label={item.transactions_missing?.toString() ?? '-'} />,
				title: 'Transações em falta',
				width: 200,
			},
			{
				accessor: 'first_transaction_id',
				render: item => <IdTag id={item.first_transaction_id ?? '-'} copyOnClick />,
				title: 'ID da primeira transação',
				width: 400,
			},
			{
				accessor: 'last_transaction_id',
				render: item => <IdTag id={item.last_transaction_id ?? '-'} copyOnClick />,
				title: 'ID da última transação',
				width: 400,
			},
			{
				accessor: 'first_transaction_ase_counter_value',
				render: item => <Tag label={item.first_transaction_ase_counter_value?.toString() ?? '-'} />,
				title: 'Valor do ASE Counter da primeira transação',
				width: 350,
			},
			{
				accessor: 'last_transaction_ase_counter_value',
				render: item => <Tag label={item.last_transaction_ase_counter_value?.toString() ?? '-'} />,
				title: 'Valor do ASE Counter da última transação',
				width: 350,
			},
			{
				accessor: 'first_transaction_type',
				render: item => <Tag label={item.first_transaction_type ?? '-'} />,
				title: 'Tipo da primeira transação',
				width: 250,
			},
			{
				accessor: 'last_transaction_type',
				render: item => <Tag label={item.last_transaction_type ?? '-'} />,
				title: 'Tipo da última transação',
				width: 250,
			},
		];
	}, []);

	return (
		<DataTable
			columns={columns as DataTableColumn<SamAnalysis>[]}
			records={records}
		/>
	);
}
