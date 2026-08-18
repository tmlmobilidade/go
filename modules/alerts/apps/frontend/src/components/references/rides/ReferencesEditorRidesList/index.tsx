'use client';

import { useReferencesEditorContext } from '@/components/references/shared/ReferencesEditor.context';
import { AlertsRidesItem } from '@tmlmobilidade/go-alerts-pckg-types';
import { Checkbox, DataTable, DataTableColumn, displayUnixTimestamp, Label, LoadingSection, NoDataLabel, OperationalDateDisplay, OperationalStatusDisplay, Section, SeenStatusDisplay, Surface, Tag } from '@tmlmobilidade/ui';

/* * */

interface ReferencesEditorRidesListProps {
	isLoading: boolean
	ridesData: AlertsRidesItem[]
}

/* * */

export function ReferencesEditorRidesList({ isLoading, ridesData }: ReferencesEditorRidesListProps) {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	const columns: DataTableColumn<AlertsRidesItem>[] = [
		{
			accessor: '_id',
			render: item => <Checkbox checked={referencesEditorContext.data.selected_references?.some(reference => reference.parent_id === item._id) ?? false} />,
			title: '',
			width: 50,
		},
		{
			accessor: 'seen_last_at',
			render: item => <SeenStatusDisplay status={item.seen_status} tooltip={displayUnixTimestamp(item.seen_last_at)} />,
			title: '',
			width: 24,
		},
		{
			accessor: 'operational_status',
			render: item => <OperationalStatusDisplay value={item.operational_status} />,
			title: 'Estado',
			width: 190,
		},
		{
			accessor: 'operational_date',
			render: item => <OperationalDateDisplay value={item.operational_date} />,
			title: 'Data',
			width: 150,
		},
		{
			accessor: 'start_time_scheduled',
			render: item => <Tag label={displayUnixTimestamp(item.start_time_scheduled)} variant="muted" />,
			title: 'Partida',
			width: 80,
		},
		{
			accessor: 'headsign',
			render: item => (
				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<Tag label={item.shape_id} variant="secondary" />
					<Label size="md" singleLine>{item.headsign}</Label>
				</Section>
			),
			title: 'Pattern',
			width: 500,
		},
	];

	//
	// C. Render components

	if (isLoading) {
		return <LoadingSection />;
	}

	if (!ridesData?.length) {
		return (
			<Section>
				<Surface>
					<Section alignItems="center">
						<NoDataLabel text="Nenhuma circulação selecionada" />
					</Section>
				</Surface>
			</Section>
		);
	}

	return (
		<DataTable
			columns={columns}
			onRowClick={item => referencesEditorContext.actions.toggleReferenceSelection(item._id)}
			records={ridesData}
			rowIdAccessor="_id"
			selectedIds={referencesEditorContext.data.selected_references?.map(reference => reference.parent_id) ?? []}
			withTopBorder
		/>
	);
}
