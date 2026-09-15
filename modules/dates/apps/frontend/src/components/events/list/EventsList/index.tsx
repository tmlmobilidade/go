'use client';

import { EventsListHeader } from '@/components/events/list/EventsListHeader';
import { EventsListFiltersBar } from '@/components/events/list/filters/EventsListFiltersBar';
import { EventsListCellAgencies } from '@/components/events/list/table/EventsListCellAgencies';
import { EventsListCellDates } from '@/components/events/list/table/EventsListCellDates';
import { type EventNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useEventsDetailEventId } from '../../detail/use-events-detail-event-id';
import { useEventsListData } from '../use-events-list-data';

/* * */

export function EventsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { eventId } = useEventsDetailEventId();

	const eventsData = useEventsListData();

	const columns: DataTableColumn<EventNormalized>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'title',
			title: 'Título',
			width: 400,
		},
		{
			accessor: 'agency_ids_normalized',
			render: item => <EventsListCellAgencies value={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <EventsListCellDates value={item.dates} />,
			title: 'Datas',
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: EventNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.EVENTS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[<EventsListHeader key="header" />, <EventsListFiltersBar key="filters" />]}>
			{eventsData.error && <ErrorDisplay message={eventsData.error} />}
			<DataTable
				columns={columns}
				isLoading={eventsData.isLoading}
				onRowClick={handleRowClick}
				records={eventsData.data}
				rowIdAccessor="_id"
				selectedId={eventId}
			/>
		</Pane>
	);
}
