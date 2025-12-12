/* * */

import { AgenciesSelector } from '@/components/layout/AgenciesSelector';
import { DemandByCategoryVisualization } from '@/components/visualizations/Demand/ByCategory';
import { DemandByProductVisualization } from '@/components/visualizations/Demand/ByProduct';
import { DemandVisualization } from '@/components/visualizations/Demand/DemandVisualization';
import { AgencyType } from '@/constants';
import { useNetworkContext } from '@/contexts/Network.context';
import { Dates } from '@tmlmobilidade/dates';
import { DatePicker, MonthPicker, MultiSelect, Section, SegmentedControl, Spacer, YearPicker } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

/* * */

const DEBOUNCE_DELAY_MS = 1000; // Delay before triggering API queries

export default function DemandByTopic() {
	//

	//
	// A. Setup variables

	const { data: networkData } = useNetworkContext();

	const [timeView, setTimeView] = useState<'annual' | 'daily' | 'monthly'>('daily');
	const [groupBy, setGroupBy] = useState<'agency' | 'line' | 'pattern'>('agency');

	// Immediate state for UI updates (user sees changes instantly)
	const [lineIdsInput, setLineIdsInput] = useState<string[]>([]);
	const [patternIdsInput, setPatternIdsInput] = useState<string[]>([]);
	const [agencyIds, setAgencyIds] = useState<AgencyType[]>([]);

	// Debounced state for API queries
	const [lineIds, setLineIds] = useState<string[]>([]);
	const [patternIds, setPatternIds] = useState<string[]>([]);

	const [startDate, setStartDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').minus({ days: 7 }));
	const [endDate, setEndDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').minus({ days: 1 }));

	//
	// B. Transform data

	const lineData = networkData.lines.map(line => ({
		label: line,
		value: line,
	})).sort((a, b) => a.label.localeCompare(b.label));

	const patternsData = networkData.patterns.map(pattern => ({
		label: pattern,
		value: pattern,
	})).sort((a, b) => a.label.localeCompare(b.label));

	const filters = useMemo(() => ({
		agencyIds,
		dateRange: { endDate, startDate },
		lineIds,
		patternIds,
	}), [agencyIds, endDate, startDate, lineIds, patternIds]);

	//
	// C. Handlers

	const handleChangeTimeView = (value: 'annual' | 'daily' | 'monthly') => {
		setTimeView(value);
	};

	const handleChangeGroupBy = (value: 'agency' | 'line' | 'pattern') => {
		setGroupBy(value);
	};

	const handleChangeStartDate = (date: null | string) => {
		setStartDate(Dates.fromISO(date || ''));
	};

	const handleChangeEndDate = (date: null | string) => {
		setEndDate(Dates.fromISO(date || ''));
	};

	//
	// D. Effects

	// Debounce logic for line IDs
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setLineIds(lineIdsInput);
		}, DEBOUNCE_DELAY_MS);

		return () => clearTimeout(timeoutId);
	}, [lineIdsInput]);

	// Debounce logic for pattern IDs
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setPatternIds(patternIdsInput);
		}, DEBOUNCE_DELAY_MS);

		return () => clearTimeout(timeoutId);
	}, [patternIdsInput]);

	// E. Render components

	return (
		<Section gap="lg" padding="none">
			<Section flexDirection="column" gap="md" padding="none">

				<Section flexDirection="row" gap="lg" padding="none">
					<Section gap="xs" padding="none" width="fit-content">
						<h3>Vista</h3>
						<SegmentedControl data={[{ label: 'Anual', value: 'annual' }, { label: 'Mensal', value: 'monthly' }, { label: 'Diária', value: 'daily' }]} onChange={handleChangeTimeView} value={timeView} />
					</Section>

					<Section gap="xs" padding="none" width="fit-content">
						<h3>Agrupar por</h3>
						<SegmentedControl data={[{ label: 'Operador', value: 'agency' }, { label: 'Linha', value: 'line' }, { label: 'Pattern', value: 'pattern' }]} onChange={handleChangeGroupBy} value={groupBy} />
					</Section>
				</Section>

				<Section alignItems="center" flexDirection="row" gap="lg" height={70} padding="none">

					{groupBy === 'line' && lineData.length > 0 && (
						<MultiSelect
							data={lineData}
							label="Linha"
							limit={20}
							onChange={setLineIdsInput}
							value={lineIdsInput}
							width={500}
						/>
					)}
					{groupBy === 'agency' && (
						<AgenciesSelector
							onChange={values => setAgencyIds(values as AgencyType[])}
							selectedAgencies={agencyIds}
						/>
					)}
					{groupBy === 'pattern' && patternsData.length > 0 && (
						<MultiSelect
							data={patternsData}
							label="Pattern"
							limit={20}
							onChange={setPatternIdsInput}
							value={patternIdsInput}
							width={500}
						/>
					)}

					{timeView === 'daily' && (
						<>
							<DatePicker label="Data de Início" locale="pt" onChange={handleChangeStartDate} placeholder="Selecionar data" value={startDate.js_date} />
							<DatePicker label="Data de Fim" locale="pt" onChange={handleChangeEndDate} placeholder="Selecionar data" value={endDate.js_date} />
						</>
					)}

					{timeView === 'monthly' && (
						<>
							<MonthPicker label="Data de Início" locale="pt" onChange={handleChangeStartDate} placeholder="Selecionar data" value={startDate.js_date} />
							<MonthPicker label="Data de Fim" locale="pt" onChange={handleChangeEndDate} placeholder="Selecionar data" value={endDate.js_date} />
						</>
					)}

					{timeView === 'annual' && (
						<>
							<YearPicker label="Data de Início" locale="pt" onChange={handleChangeStartDate} placeholder="Selecionar data" value={startDate.js_date} />
							<YearPicker label="Data de Fim" locale="pt" onChange={handleChangeEndDate} placeholder="Selecionar data" value={endDate.js_date} />
						</>
					)}

				</Section>

			</Section>

			<Spacer />

			<DemandVisualization filters={filters} groupBy={groupBy} height={300} timeView={timeView} />

			<Spacer />

			<DemandByProductVisualization filters={filters} groupBy={groupBy} height={300} timeView={timeView} title="Passageiros transportados por tipo de passe" />

			<Spacer />

			<DemandByCategoryVisualization filters={filters} groupBy={groupBy} height={300} timeView={timeView} title="Passageiros transportados por categoria de bilhética" />

		</Section>
	);
}

//
