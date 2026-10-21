'use client';

import { EventsListCellAgencies } from '@/components/events/list/EventsListCellAgencies';
import { EventsListCellDates } from '@/components/events/list/EventsListCellDates';
import { EventsListFiltersBar } from '@/components/events/list/EventsListFiltersBar';
import { EventsListHeader } from '@/components/events/list/EventsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useEventsDetailEventId } from '../../detail/use-events-detail-event-id';
import { useEventsListData } from '../use-events-list-data';

/* * */

export function EventsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { eventId } = useEventsDetailEventId();
	const { t } = useTranslation();

	const { data, error, isLoading } = useEventsListData();

	const columns: DataTableColumn<Event>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:events.list.columns.id'),
			width: 100,
		},
		{
			accessor: 'title',
			title: t('default:events.list.columns.title'),
			width: 400,
		},
		{
			accessor: 'agency_ids',
			render: item => <EventsListCellAgencies agencyIds={item.agency_ids} />,
			title: t('default:events.list.columns.agency_ids'),
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <EventsListCellDates dates={item.dates} />,
			title: t('default:events.list.columns.dates'),
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Event) => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.EVENTS_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (isLoading) {
		return (
			<LoadingOverlay />
		);
	}

	if (error) {
		return (
			<ErrorDisplay message={error} />
		);
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
				records={data}
				rowIdAccessor="_id"
				selectedId={eventId}
			/>
		</Pane>
	);

	//
}
