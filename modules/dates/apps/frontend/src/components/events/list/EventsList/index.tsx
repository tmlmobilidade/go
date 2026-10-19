'use client';

import { useEventsListContext } from '@/components/events/list/EventsList.context';
import { EventsListCellAgencies } from '@/components/events/list/EventsListCellAgencies';
import { EventsListCellDates } from '@/components/events/list/EventsListCellDates';
import { EventsListFiltersBar } from '@/components/events/list/EventsListFiltersBar';
import { EventsListHeader } from '@/components/events/list/EventsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function EventsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const eventsListContext = useEventsListContext();

	const columns: DataTableColumn<Event>[] = [
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
			accessor: 'agency_ids',
			render: item => <EventsListCellAgencies agencyIds={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <EventsListCellDates dates={item.dates} />,
			title: 'Datas',
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Event) => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.EVENTS_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (eventsListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (eventsListContext.flags.error) {
		return <ErrorDisplay message={eventsListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<EventsListHeader key="header" />,
			<EventsListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={eventsListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
