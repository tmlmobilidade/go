/* * */

import { AgenciesSelector } from '@/components/layout/AgenciesSelector';
import { DemandByCategoryVisualization } from '@/components/visualizations/Demand/ByCategory';
import { DemandByProductVisualization } from '@/components/visualizations/Demand/ByProduct';
import { DemandVisualization } from '@/components/visualizations/Demand/DemandVisualization';
import { AgencyType } from '@/constants';
import { useNetworkContext } from '@/contexts/Network.context';
import { Dates } from '@tmlmobilidade/dates';
import { DateInput, MonthPicker, MultiSelect, Section, SegmentedControl, Spacer, YearPicker } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

const DEBOUNCE_DELAY_MS = 1000; // Delay before triggering API queries

export default function DemandByTopic() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('performance', { keyPrefix: 'DemandByTopic' });
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
						<h3>{t('filters.view.label')}</h3>
						<SegmentedControl
							onChange={handleChangeTimeView}
							value={timeView}
							data={[
								{ label: t('filters.view.options.annual'), value: 'annual' },
								{ label: t('filters.view.options.monthly'), value: 'monthly' },
								{ label: t('filters.view.options.daily'), value: 'daily' },
							]}
						/>
					</Section>

					<Section gap="xs" padding="none" width="fit-content">
						<h3>{t('filters.groupBy.label')}</h3>
						<SegmentedControl
							onChange={handleChangeGroupBy}
							value={groupBy}
							data={[
								{ label: t('filters.groupBy.options.agency'), value: 'agency' },
								{ label: t('filters.groupBy.options.line'), value: 'line' },
								{ label: t('filters.groupBy.options.pattern'), value: 'pattern' },
							]}
						/>
					</Section>
				</Section>

				<Section alignItems="center" flexDirection="row" gap="lg" height={70} padding="none">

					{groupBy === 'line' && lineData.length > 0 && (
						<MultiSelect
							data={lineData}
							label={t('filters.line.label')}
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
							label={t('filters.pattern.label')}
							limit={20}
							onChange={setPatternIdsInput}
							value={patternIdsInput}
							width={500}
						/>
					)}

					{timeView === 'daily' && (
						<>
							<DateInput
								label={t('filters.date.startLabel')}
								locale="pt"
								onChange={handleChangeStartDate}
								placeholder={t('filters.date.placeholder')}
								value={startDate.js_date}
							/>
							<DateInput
								label={t('filters.date.endLabel')}
								locale="pt"
								onChange={handleChangeEndDate}
								placeholder={t('filters.date.placeholder')}
								value={endDate.js_date}
							/>
						</>
					)}

					{timeView === 'monthly' && (
						<>
							<MonthPicker
								label={t('filters.date.startLabel')}
								locale="pt"
								onChange={handleChangeStartDate}
								placeholder={t('filters.date.placeholder')}
								value={startDate.js_date}
							/>
							<MonthPicker
								label={t('filters.date.endLabel')}
								locale="pt"
								onChange={handleChangeEndDate}
								placeholder={t('filters.date.placeholder')}
								value={endDate.js_date}
							/>
						</>
					)}

					{timeView === 'annual' && (
						<>
							<YearPicker
								label={t('filters.date.startLabel')}
								locale="pt"
								onChange={handleChangeStartDate}
								placeholder={t('filters.date.placeholder')}
								value={startDate.js_date}
							/>
							<YearPicker
								label={t('filters.date.endLabel')}
								locale="pt"
								onChange={handleChangeEndDate}
								placeholder={t('filters.date.placeholder')}
								value={endDate.js_date}
							/>
						</>
					)}

				</Section>

			</Section>

			<Spacer />

			<DemandVisualization filters={filters} groupBy={groupBy} height={300} timeView={timeView} />

			<Spacer />

			<DemandByProductVisualization
				filters={filters}
				groupBy={groupBy}
				height={300}
				timeView={timeView}
				title={t('charts.byProductTitle')}
			/>

			<Spacer />

			<DemandByCategoryVisualization
				filters={filters}
				groupBy={groupBy}
				height={300}
				timeView={timeView}
				title={t('charts.byCategoryTitle')}
			/>

		</Section>
	);
}

//
