'use client';

import { useAgenciesListContext } from '@/components/agencies/list/AgenciesList.context';
import { AgenciesListHeader } from '@/components/agencies/list/AgenciesListHeader';
import { type AgencyNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { IdTag, keepUrlParams } from '@tmlmobilidade/ui';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
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
			render: item => <IdTag id={item._id} />,
			title: t('default:agencies.list.Table.columns.id'),
			width: 80,
		},
		{
			accessor: 'code',
			render: item => <IdTag id={item.code} />,
			title: t('default:agencies.list.Table.columns.code'),
			width: 80,
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
