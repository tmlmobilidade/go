'use client';

/* * */

import { getDelayStatus, StartTimeStatusTag } from '@/components/common/StartTimeStatusTag';
import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { RidesData } from '@/contexts/Rides.context';
import { Dates } from '@tmlmobilidade/dates';
import { DataTable, DataTableColumn, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeDetailSectionAffectedRides() {
	//
	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.detail.sectionReferences' });

	//
	// B. Transform data

	const columns: DataTableColumn<RidesData>[] = [
		{
			accessor: '_id',
			title: t('fields.id'),
			width: 400,
		},
		{
			accessor: 'headsign',
			title: t('fields.headsign'),
			width: 300,
		},
		{
			accessor: 'start_time_scheduled',
			render: item => (
				<StartTimeStatusTag
					startTimeObserved={Dates.fromUnixTimestamp(item.start_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt')}
					status={getDelayStatus(item.start_time_scheduled, item.start_time_observed)}
				/>
			),
			title: t('fields.startTime'),
			width: 300,
		},
	];

	return (
		<Section gap="md">
			<Label size="md" caps>{t('fields.affectedRides')}</Label>
			<div style={{ overflowX: 'scroll', width: '100%' }}>
				<DataTable
					columns={columns as DataTableColumn<unknown>[]}
					records={realtimeDetailContext.data.selectedRides}
					rowIdAccessor="_id"
				/>
			</div>
		</Section>
	);
}
