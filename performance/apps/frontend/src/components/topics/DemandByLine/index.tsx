/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { DemandByLineByDayVisualization } from '@/components/visualizations/DemandByLineByDay';
import { useLinesContext } from '@/contexts/Lines.context';
import { Combobox, DatePicker } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useState } from 'react';

import styles from './styles.module.css';

export default function DemandByLineTopic() {
	//

	//
	// A. Setup variables

	const { data } = useLinesContext();

	const [lineId, setLineId] = useState<null | string>(null);
	const [startDate, setStartDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').minus({ days: 30 }));
	const [endDate, setEndDate] = useState<Dates | null>(Dates.now('Europe/Lisbon').minus({ days: 1 }));

	//
	// B. Transform data

	const lineItems = data.lines.map(line => ({
		label: line.id,
		value: line.id,
	}));

	const handleChangeStartDate = (date: null | string) => {
		setStartDate(Dates.fromISO(date || ''));
	};

	const handleChangeEndDate = (date: null | string) => {
		setEndDate(Dates.fromISO(date || ''));
	};

	// C. Render components

	// TODO: Abstract filters

	return (
		<div className={styles.container}>
			<div className={styles.filtersWrapper}>
				<Combobox
					data={lineItems}
					label="Linha"
					onChange={setLineId}
					placeholder="Selecionar linha"
					searchable
				/>

				<DatePicker label="Data de Início" locale="pt" onChange={handleChangeStartDate} placeholder="Selecionar data" value={startDate.js_date} />
				<DatePicker label="Data de Fim" locale="pt" onChange={handleChangeEndDate} placeholder="Selecionar data" value={endDate.js_date} />
			</div>

			<ContainerWrapper>
				<DemandByLineByDayVisualization chartType="line" endDate={endDate} height={400} lineId={lineId} startDate={startDate} />
			</ContainerWrapper>
		</div>
	);
}

//
