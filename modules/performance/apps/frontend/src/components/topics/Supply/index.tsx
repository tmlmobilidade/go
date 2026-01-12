/* * */

import { AgenciesSelector } from '@/components/layout/AgenciesSelector';
import { Circulations } from '@/components/visualizations/Circulations';
import RecordSupply from '@/components/visualizations/RecordVkms';
import { VmksScheduled } from '@/components/visualizations/VkmsScheduled';
import { AgencyType } from '@/constants';
import { Dates } from '@tmlmobilidade/dates';
import { DateInput, MonthPicker, Section, SegmentedControl, Spacer, YearPicker } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export default function SupplyTopic() {
	//

	//
	// A. Setup variables

	const [timeView, setTimeView] = useState<'annual' | 'daily' | 'monthly'>('monthly');
	const [agencyIds, setAgencyIds] = useState<AgencyType[]>([]);

	const [startDate, setStartDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').set({ day: 1, month: 1 }));
	const [endDate, setEndDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').set({ day: 31, month: 12 }));

	const { t } = useTranslation();

	//
	// B. Transform data

	const filters = useMemo(() => ({
		agencyIds,
		dateRange: { endDate, startDate },
	}), [agencyIds, endDate, startDate]);

	//
	// C. Handlers

	const handleChangeTimeView = (value: 'annual' | 'daily' | 'monthly') => {
		setTimeView(value);
	};

	const handleChangeStartDate = (date: null | string) => {
		setStartDate(Dates.fromISO(date || ''));
	};

	const handleChangeEndDate = (date: null | string) => {
		setEndDate(Dates.fromISO(date || ''));
	};

	// D. Render components

	return (
		<Section gap="lg" padding="none">
			<Section flexDirection="column" gap="md" padding="none">

				<Section alignItems="center" flexDirection="row" gap="lg" height={70} padding="none">

					<Section gap="xs" padding="none" width="fit-content">
						<h3>{t('performance:SupplyTopic.filters.view.label')}</h3>
						<SegmentedControl
							onChange={handleChangeTimeView}
							value={timeView}
							data={[
								{ label: t('performance:SupplyTopic.filters.view.options.annual'), value: 'annual' },
								{ label: t('performance:SupplyTopic.filters.view.options.monthly'), value: 'monthly' },
								{ label: t('performance:SupplyTopic.filters.view.options.daily'), value: 'daily' },
							]}
						/>
					</Section>

					{timeView === 'daily' && (
						<>
							<DateInput
								label={t('performance:SupplyTopic.filters.date.start_label')}
								locale="pt"
								onChange={handleChangeStartDate}
								placeholder={t('performance:SupplyTopic.filters.date.placeholder')}
								value={startDate.js_date}
							/>
							<DateInput
								label={t('performance:SupplyTopic.filters.date.end_label')}
								locale="pt"
								onChange={handleChangeEndDate}
								placeholder={t('performance:SupplyTopic.filters.date.placeholder')}
								value={endDate.js_date}
							/>
						</>
					)}

					{timeView === 'monthly' && (
						<>
							<MonthPicker
								label={t('performance:SupplyTopic.filters.date.start_label')}
								locale="pt"
								onChange={handleChangeStartDate}
								placeholder={t('performance:SupplyTopic.filters.date.placeholder')}
								value={startDate.js_date}
							/>
							<MonthPicker
								label={t('performance:SupplyTopic.filters.date.end_label')}
								locale="pt"
								onChange={handleChangeEndDate}
								placeholder={t('performance:SupplyTopic.filters.date.placeholder')}
								value={endDate.js_date}
							/>
						</>
					)}

					{timeView === 'annual' && (
						<>
							<YearPicker
								label={t('performance:SupplyTopic.filters.date.start_label')}
								locale="pt"
								onChange={handleChangeStartDate}
								placeholder={t('performance:SupplyTopic.filters.date.placeholder')}
								value={startDate.js_date}
							/>
							<YearPicker
								label={t('performance:SupplyTopic.filters.date.end_label')}
								locale="pt"
								onChange={handleChangeEndDate}
								placeholder={t('performance:SupplyTopic.filters.date.placeholder')}
								value={endDate.js_date}
							/>
						</>
					)}

					<AgenciesSelector
						onChange={values => setAgencyIds(values as AgencyType[])}
						selectedAgencies={agencyIds}
					/>

				</Section>

			</Section>

			<Spacer />

			<RecordSupply filters={filters} timeView={timeView} />

			<Circulations filters={filters} groupBy="agency" height={300} timeView={timeView} />

			<VmksScheduled filters={filters} groupBy="agency" height={300} timeView={timeView} />

		</Section>
	);
}

//
