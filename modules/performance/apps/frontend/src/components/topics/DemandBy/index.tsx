/* * */

import { DemandByProductVisualization } from '@/components/visualizations/Demand/ByProduct';
import { DemandVisualization } from '@/components/visualizations/Demand/DemandVisualization';
import { AGENCIES, AgencyType } from '@/constants';
import { useNetworkContext } from '@/contexts/Network.context';
import { Dates } from '@tmlmobilidade/dates';
import { Combobox, DatePicker, MonthPicker, MultiSelect, Section, SegmentedControl, Spacer, YearPicker } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

export default function DemandByTopic() {
	//

	//
	// A. Setup variables

	const { data: networkData } = useNetworkContext();
	const t = useTranslations();

	const [timeView, setTimeView] = useState<'annual' | 'daily' | 'monthly'>('daily');
	const [groupBy, setGroupBy] = useState<'agency' | 'line' | 'pattern'>('agency');

	const [lineIds, setLineIds] = useState<string[]>([]);
	const [patternIds, setPatternIds] = useState<string[]>([]);
	const [agencyId, setAgencyId] = useState<AgencyType>(AGENCIES.ALL);

	const [startDate, setStartDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').minus({ days: 7 }));
	const [endDate, setEndDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').minus({ days: 1 }));

	//
	// B. Transform data

	const lineData = useMemo(() => networkData.lines.map(line => ({
		label: line,
		value: line,
	})), [networkData]);

	const patternsData = useMemo(() => networkData.patterns.map(pattern => ({
		label: pattern,
		value: pattern,
	})), [networkData]);

	const agenciesData = useMemo(() => {
		const agencies = Object.values(AGENCIES)
			.map(value => ({
				label: t(`agencies.${value}`),
				value,
			}));
		return agencies;
	}, [t, agencyId]);

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

	const handleChangeAgencyId = (value: AgencyType) => {
		setAgencyId(value);
	};

	// C. Render components

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

				<Section flexDirection="row" gap="lg" padding="none">

					{groupBy === 'line' && lineData.length > 0 && (
						<MultiSelect
							data={lineData}
							label="Linha"
							limit={20}
							onChange={setLineIds}
							selected={lineIds}
							width={500}
						/>
					)}
					{groupBy === 'agency' && (
						<Combobox
							data={agenciesData}
							label="Operador"
							onChange={handleChangeAgencyId}
							placeholder="Selecionar"
							value={agencyId}
							width={150}
						/>
					)}
					{groupBy === 'pattern' && patternsData.length > 0 && (
						<MultiSelect
							data={patternsData}
							label="Pattern"
							limit={20}
							onChange={setPatternIds}
							selected={patternIds}
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

			<DemandVisualization filters={{ agencyId, dateRange: { endDate, startDate }, lineIds, patternIds }} groupBy={groupBy} height={300} timeView={timeView} />

			<DemandByProductVisualization filters={{ agencyId, dateRange: { endDate, startDate }, lineIds, patternIds }} groupBy={groupBy} height={300} timeView={timeView} title="Passageiros transportados por tipo de passe" />

		</Section>
	);
}

//
