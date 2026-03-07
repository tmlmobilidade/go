'use client';

/* * */

import { useEventsListContext } from '@/components/events/list/EventsList.context';
import { EventsListCellAgencies } from '@/components/events/list/EventsListCellAgencies';
import { EventsListCellDates } from '@/components/events/list/EventsListCellDates';
import { EventsListFiltersBar } from '@/components/events/list/EventsListFiltersBar';
import { EventsListHeader } from '@/components/events/list/EventsListHeader';
import { type EventNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
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

	const columns: DataTableColumn<EventNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="id" />,
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

	const handleRowClick = (item: EventNormalized) => {
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
