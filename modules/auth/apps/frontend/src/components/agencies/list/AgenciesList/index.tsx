'use client';

/* * */

import { useAgenciesListContext } from '@/components/agencies/list/AgenciesList.context';
import { AgenciesListHeader } from '@/components/agencies/list/AgenciesListHeader';
import { type AgencyNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function AgenciesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const agenciesListContext = useAgenciesListContext();
	const { t } = useTranslation();

	const columns: DataTableColumn<AgencyNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="id" />,
			title: t('default:agencies.list.Table.columns.id'),
			width: 50,
		},
		{
			accessor: 'name',
			title: t('default:agencies.list.Table.columns.name'),
			width: 600,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: AgencyNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.AGENCIES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (agenciesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (agenciesListContext.flags.error) {
		return <ErrorDisplay message={agenciesListContext.flags.error.message} />;
	}

	return (
		<Pane header={[<AgenciesListHeader key="header" />]}>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={agenciesListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
