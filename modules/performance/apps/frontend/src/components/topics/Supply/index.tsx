/* * */

import { AgenciesSelector } from '@/components/layout/AgenciesSelector';
import { Circulations } from '@/components/visualizations/Circulations';
import RecordSupply from '@/components/visualizations/RecordVkms';
import { VmksScheduled } from '@/components/visualizations/VkmsScheduled';
import { AgencyType } from '@/constants';
import { Dates } from '@tmlmobilidade/dates';
import { DateInput, MonthPicker, Section, SegmentedControl, Spacer, YearPicker } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

export default function SupplyTopic() {
	//

	//
	// A. Setup variables

	const [timeView, setTimeView] = useState<'annual' | 'daily' | 'monthly'>('monthly');
	const [agencyIds, setAgencyIds] = useState<AgencyType[]>([]);

	const [startDate, setStartDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').set({ day: 1, month: 1 }));
	const [endDate, setEndDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').set({ day: 31, month: 12 }));

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
						<h3>Vista</h3>
						<SegmentedControl data={[{ label: 'Anual', value: 'annual' }, { label: 'Mensal', value: 'monthly' }, { label: 'Diária', value: 'daily' }]} onChange={handleChangeTimeView} value={timeView} />
					</Section>

					{timeView === 'daily' && (
						<>
							<DateInput label="Data de Início" locale="pt" onChange={handleChangeStartDate} placeholder="Selecionar data" value={startDate.js_date} />
							<DateInput label="Data de Fim" locale="pt" onChange={handleChangeEndDate} placeholder="Selecionar data" value={endDate.js_date} />
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
