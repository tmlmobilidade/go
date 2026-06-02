'use client';

import { AlertExpandToggle } from '@/components/alerts/common/AlertExpandToggle';
import SelectCause from '@/components/alerts/common/SelectCause';
import SelectEffect from '@/components/alerts/common/SelectEffect';
import { SelectLine } from '@/components/alerts/common/SelectLine';
import { SelectStop } from '@/components/alerts/common/SelectStop';
import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { FoundItemsCounter } from '@/components/layout/FoundItemsCounter';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { SegmentedControl } from '@mantine/core';
import { SearchInput, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertsListToolbar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const alertsListContext = useAlertsListContext();

	//
	// B. Transform data

	const currentViewOptions = [
		{ label: t('default:alerts.AlertsListToolbar.by_date.current', '', { count: alertsListContext.counters.by_date.current }), value: 'current' },
		{ label: t('default:alerts.AlertsListToolbar.by_date.future', '', { count: alertsListContext.counters.by_date.future }), value: 'future' },
		{ label: t('default:alerts.AlertsListToolbar.filters.by_current_view.map'), value: 'map' },
	];

	//
	// D. Render components

	return (
		<Section gap="md">
			<SearchInput onChange={alertsListContext.filters.search.set} value={alertsListContext.filters.search.value} />
			<SegmentedControl data={currentViewOptions} onChange={alertsListContext.actions.toggle} value={alertsListContext.view.current} w="100%" fullWidth />

			<AlertExpandToggle defaultState={!!alertsListContext.filters.line_id || !!alertsListContext.filters.stop_id || !!alertsListContext.filters.cause || !!alertsListContext.filters.effect}>
				<div className={styles.selectsWrapper}>
					{/* <SelectLine
						data={linesContext.data.lines}
						label={t('default:alerts.AlertsListToolbar.filters.by_line.label')}
						onSelectLineId={alertsListContext.actions.updateFilterByLineId}
						placeholder={t('default:alerts.AlertsListToolbar.filters.by_line.placeholder')}
						selectedLineId={alertsListContext.filters.line_id}
						variant="default"
					/>
					<SelectStop
						data={stopsContext.data.stops}
						label={t('default:alerts.AlertsListToolbar.filters.by_stop.label')}
						onSelectStopId={alertsListContext.actions.updateFilterByStopId}
						placeholder={t('default:alerts.AlertsListToolbar.filters.by_stop.placeholder')}
						selectedStopId={alertsListContext.filters.stop_id}
						variant="default"
					/> */}
					<SelectCause onChange={alertsListContext.actions.updateFilterByCause} value={alertsListContext.filters.cause} />
					<SelectEffect onChange={alertsListContext.actions.updateFilterByEffect} value={alertsListContext.filters.effect} />
				</div>
			</AlertExpandToggle>
			<FoundItemsCounter text={t('default:alerts.AlertsListToolbar.found_items_counter', '', { count: alertsListContext.data.filtered.length })} />

		</Section>
	);
}
