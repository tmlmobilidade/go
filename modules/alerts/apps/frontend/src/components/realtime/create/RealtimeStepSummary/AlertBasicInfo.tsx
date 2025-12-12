import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { getAlertTitleAndDescription } from '@/lib/translations';
import { CoordinatesInput, Description, Label, Section, TextInput } from '@tmlmobilidade/ui';

export function AlertBasicInfo() {
	const realtimeContext = useRealtimeCreateContext();

	return (
		<Section gap="md">
			<Label size="lg">Resumo do alerta</Label>
			<div>
				<Label size="md">Título</Label>
				<Description>{realtimeContext.data.form.values.title}</Description>
			</div>
			<div>
				<Label size="md">Descrição</Label>
				<Description>{realtimeContext.data.form.values.description}</Description>
			</div>
			{
				realtimeContext.data.form.values.effect === 'DETOUR' && realtimeContext.data.form.values.cause === 'CONSTRUCTION' && (
					<>
						<TextInput
							label="Percurso alternativo"
							value={realtimeContext.data.detour}
							onChange={(event) => {
								realtimeContext.actions.setDetour(event.target.value);
								const uniqueLineIds = Array.from(new Set(realtimeContext.data.selectedRides.map(ride => ride.line_id)));
								const { description } = getAlertTitleAndDescription(realtimeContext.data.form.values.cause, realtimeContext.data.form.values.effect, uniqueLineIds.join(', '), event.target.value);
								realtimeContext.data.form.setFieldValue('description', description);
							}}
							withAsterisk
						/>
					</>
				)
			}
			<CoordinatesInput
				description="Ponto de referência do alerta, para que seja possível localizar o alerta no mapa."
				{...realtimeContext.data.form.getInputProps('coordinates')}
			/>
		</Section>
	);
}
