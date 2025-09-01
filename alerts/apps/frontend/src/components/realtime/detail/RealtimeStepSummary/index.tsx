/* * */

import { getDelayStatus, StartTimeStatusTag } from '@/components/common/StartTimeStatusTag';
import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { RidesData } from '@/contexts/Rides.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { CoordinatesInput, DataTable, DataTableColumn, Label, Section, Separator, Textarea, TextInput } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function RealtimeStepSummary() {
	//
	// A. Setup variables

	const realtimeContext = useRealtimeDetailContext();

	//
	// B. Render components

	const columns: DataTableColumn<RidesData>[] = [
		{
			accessor: '_id',
			title: 'ID',
			width: 400,
		},
		{
			accessor: 'headsign',
			title: 'Destino',
			width: 300,
		},
		{
			accessor: 'start_time_scheduled',
			render: item => (
				<StartTimeStatusTag
					startTimeObserved={Dates.fromUnixTimestamp(item.start_time_scheduled).toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt')}
					status={getDelayStatus(item.start_time_scheduled, item.start_time_observed)}
				/>
			),
			title: 'Partida',
			width: 300,
		},
	];

	return (
		<div style={{ overflowX: 'hidden', width: '100%' }}>
			<Section gap="md">
				<Label size="lg">Resumo do alerta</Label>
				<TextInput
					description="É importante que o título seja curto e claro, para que não apareça cortado no site, apps, etc."
					label="Título Curto"
					maxLength={255}
					placeholder="..."
					withAsterisk
					{...realtimeContext.data.form.getInputProps('title')}
				/>
				<Textarea
					description="Um bom alerta explica a situação de forma breve e clara, explicita as suas causas e como está a ser mitigado, e apresenta uma ou mais soluções de como o passageiro poderá ultrapassar esta situação."
					label="Descrição"
					maxRows={10}
					minRows={4}
					placeholder="..."
					autosize
					withAsterisk
					{...realtimeContext.data.form.getInputProps('description')}
				/>
				<CoordinatesInput
					description="Ponto de referência do alerta, para que seja possível localizar o alerta no mapa."
					{...realtimeContext.data.form.getInputProps('coordinates')}
				/>
				{/* Cause and Effect */}
				<Separator />
				<Label size="sm" caps>Causa e Efeito</Label>
				<Section flexDirection="row" gap="md" padding="none">
					<Section flexDirection="row" gap="md" padding="none">
						{CauseIcons[realtimeContext.data.form.values.cause]}
						{Translations.CAUSE[realtimeContext.data.form.values.cause]}
					</Section>
					<Section flexDirection="row" gap="md" padding="none">
						{EffectIcons[realtimeContext.data.form.values.effect]}
						{Translations.CAUSE[realtimeContext.data.form.values.effect]}
					</Section>
				</Section>

				{/* References */}
				<Separator />
				<Label size="sm" caps>Viagens afetadas</Label>
				<div style={{ overflowX: 'scroll', width: '100%' }}>
					<DataTable
						columns={columns as DataTableColumn<unknown>[]}
						records={realtimeContext.data.selectedRides}
						rowIdAccessor="_id"
					/>
				</div>
			</Section>
		</div>
	);
}
