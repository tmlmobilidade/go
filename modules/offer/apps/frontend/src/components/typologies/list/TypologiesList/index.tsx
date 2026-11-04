'use client';

import { TypologiesListFiltersBar } from '@/components/typologies/list/filters/TypologiesListFiltersBar';
import { TypologiesListCellAgencies } from '@/components/typologies/list/TypologiesListCellAgencies';
import { TypologiesListHeader } from '@/components/typologies/list/TypologiesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Typology } from '@tmlmobilidade/go-types-offer';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LineBadge, LoadingOverlay, Pane, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useTypologiesDetailTypologyId } from '../../detail/use-typologies-detail-typology-id';
import { useTypologiesListData } from '../use-typologies-list-data';

/* * */

export function TypologiesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data, error, isLoading } = useTypologiesListData();
	const { typologyId } = useTypologiesDetailTypologyId();
	const { t } = useTranslation();

	const columns: DataTableColumn<Typology>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:typologies.list.columns.id'),
			width: 100,
		},
		{
			accessor: 'code',
			render: item => <Text>{item.code}</Text>,
			title: t('default:typologies.list.columns.code'),
			width: 200,
		},
		{
			accessor: 'name',
			render: item => <LineBadge color={item.color} shortName={item.name} size="full-width" textColor={item.text_color} />,
			title: t('default:typologies.list.columns.name'),
			width: 300,
		},
		{
			accessor: 'agency_ids',
			render: item => <TypologiesListCellAgencies agencyIds={item.agency_ids} />,
			title: t('default:typologies.list.columns.agency_ids'),
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Typology) => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (error) {
		return <ErrorDisplay message={error} />;
	}

	return (
		<Pane header={[
			<TypologiesListHeader key="header" />,
			<TypologiesListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={data}
				rowIdAccessor="_id"
				selectedId={typologyId}
			/>
		</Pane>
	);

	//
}
