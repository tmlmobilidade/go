'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { SegmentedControl } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Section } from '@tmlmobilidade/ui';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertsListToolbar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertsContext = useAlertsListContext();
	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const [searchQuery, setSearchQuery] = useState(alertsContext.filters.search_query);

	//
	// B. Transform data

	const byCurrentStatusOptions = [
		{ label: t('default:alerts.AlertsListToolbar.by_date.current'), value: 'current' },
		{ label: t('default:alerts.AlertsListToolbar.by_date.future'), value: 'future' },
		{ label: t('default:alerts.AlertsListToolbar.by_date.map'), value: 'map' },
	];

	//
	// C. Handle actions

	const handleFilterBySearchQuery = (event: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
		alertsContext.actions.updateFilterBySearchQuery(event.target.value);
	};

	//
	// D. Render components

	return (
		<Section>
			<SegmentedControl data={byCurrentStatusOptions} onChange={alertsContext.actions.updateFilterByDate} value={alertsContext.filters.by_date} w="100%" fullWidth />
			{/* {alertsContext.filters.by_date !== 'map' && (
				<>
					<Input leftSection={<IconSearch size={20} />} onChange={handleFilterBySearchQuery} placeholder={t('filters.text_search')} value={searchQuery ?? ''} w="100%" />
					<ExpandToggle defaultState={!!alertsContext.filters.line_id || !!alertsContext.filters.stop_id || !!alertsContext.filters.cause || !!alertsContext.filters.effect}>
						<div className={styles.selectsWrapper}>
							<SelectLine
								data={linesContext.data.lines}
								label={t('filters.by_line.label')}
								onSelectLineId={alertsContext.actions.updateFilterByLineId}
								placeholder={t('filters.by_line.placeholder')}
								selectedLineId={alertsContext.filters.line_id}
								variant="default"
							/>
							<SelectStop
								data={stopsContext.data.stops}
								label={t('filters.by_stop.label')}
								onSelectStopId={alertsContext.actions.updateFilterByStopId}
								placeholder={t('filters.by_stop.placeholder')}
								selectedStopId={alertsContext.filters.stop_id}
								variant="default"
							/>
							<SelectCause onChange={alertsContext.actions.updateFilterByCause} value={alertsContext.filters.cause} />
							<SelectEffect onChange={alertsContext.actions.updateFilterByEffect} value={alertsContext.filters.effect} />
						</div>
					</ExpandToggle>
					<FoundItemsCounter text={t('found_items_counter', { count: alertsContext.data.filtered.length })} />
				</>
			)} */}
		</Section>
	);

	//
}
