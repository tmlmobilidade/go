/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { formatUnixTimestampToDateString } from '@/lib/utils';
import { SamAnalysis } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Label } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

const normalizeAnalysisApex = (value: null | string | undefined): string => {
	if (value == null) return '';
	const trimmed = value.trim();
	return trimmed;
};

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

	//
	// B. Setup variables

	const filterStart = samDetailContext.ui.analysisFilterStartTime;
	const filterEnd = samDetailContext.ui.analysisFilterEndTime;
	const apexSelection = samDetailContext.ui.analysisApexVersionFilter;
	const hasDateFilter = filterStart != null && filterEnd != null;

	const records = useMemo(() => {
		const analysisRecords = samDetailContext.data.sam?.analysis ?? [];
		const uniqueApexValues = [...new Set(analysisRecords.map(a => normalizeAnalysisApex(a.apex_version)))];
		const apexFilterActive =
			uniqueApexValues.length > 0
			&& apexSelection.length > 0
			&& apexSelection.length < uniqueApexValues.length;

		let next = analysisRecords;
		if (apexFilterActive)
			next = next.filter(analysis => apexSelection.includes(normalizeAnalysisApex(analysis.apex_version)));
		if (hasDateFilter && filterStart != null && filterEnd != null)
			next = next.filter(analysis => hasRangeOverlap(analysis, filterStart, filterEnd));
		return next;
	}, [apexSelection, filterEnd, filterStart, hasDateFilter, samDetailContext.data.sam?.analysis]);

	//
	// C. Render components

	const columns = useMemo(() => {
		return [
			{
				accessor: 'start_time',
				render: item => item.start_time ? <Label>{formatUnixTimestampToDateString(item.start_time)}</Label> : <Label>N/A</Label>,
				title: 'Data de início',
				width: 200,
			},
			{
				accessor: 'end_time',
				render: item => item.end_time ? <Label>{formatUnixTimestampToDateString(item.end_time)}</Label> : <Label>N/A</Label>,
				title: 'Data de fim',
				width: 200,
			},
			{
				accessor: 'device_id',
				render: item => item.device_id ? <Label>{item.device_id}</Label> : <Label>N/A</Label>,
				title: 'Device ID',
				width: 250,
			},
			{
				accessor: 'vehicle_id',
				render: item => item.vehicle_id ? <Label>{item.vehicle_id}</Label> : <Label>N/A</Label>,
				title: 'Vehicle ID',
				width: 100,
			},
			{
				accessor: 'apex_version',
				render: item => item.apex_version ? <Label>{item.apex_version}</Label> : <Label>N/A</Label>,
				title: 'Versão APEX',
				width: 100,
			},
			{
				accessor: 'transactions_expected',
				render: item => item.transactions_expected ? <Label>{item.transactions_expected.toString()}</Label> : <Label>-</Label>,
				title: 'Transações esperadas',
				width: 200,
			},
			{
				accessor: 'transactions_found',
				render: item => item.transactions_found ? <Label>{item.transactions_found.toString()}</Label> : <Label>-</Label>,
				title: 'Transações encontradas',
				width: 200,
			},
			{
				accessor: 'transactions_missing',
				render: item => item.transactions_missing ? <Label>{item.transactions_missing.toString()}</Label> : <Label>-</Label>,
				title: 'Transações em falta',
				width: 200,
			},
			{
				accessor: 'first_transaction_id',
				render: item => item.first_transaction_id ? <Label>{item.first_transaction_id}</Label> : <Label>N/A</Label>,
				title: 'ID da primeira transação',
				width: 400,
			},
			{
				accessor: 'last_transaction_id',
				render: item => item.last_transaction_id ? <Label>{item.last_transaction_id}</Label> : <Label>N/A</Label>,
				title: 'ID da última transação',
				width: 400,
			},
			{
				accessor: 'first_transaction_ase_counter_value',
				render: item => item.first_transaction_ase_counter_value ? <Label>{item.first_transaction_ase_counter_value.toString()}</Label> : <Label>-</Label>,
				title: 'Valor do ASE Counter da primeira transação',
				width: 350,
			},
			{
				accessor: 'last_transaction_ase_counter_value',
				render: item => item.last_transaction_ase_counter_value ? <Label>{item.last_transaction_ase_counter_value.toString()}</Label> : <Label>-</Label>,
				title: 'Valor do ASE Counter da última transação',
				width: 350,
			},
			{
				accessor: 'first_transaction_type',
				render: item => item.first_transaction_type ? <Label>{item.first_transaction_type}</Label> : <Label>N/A</Label>,
				title: 'Tipo da primeira transação',
				width: 250,
			},
			{
				accessor: 'last_transaction_type',
				render: item => item.last_transaction_type ? <Label>{item.last_transaction_type}</Label> : <Label>N/A</Label>,
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
