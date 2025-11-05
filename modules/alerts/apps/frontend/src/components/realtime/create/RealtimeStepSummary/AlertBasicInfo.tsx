import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { CoordinatesInput, Description, Label, Section } from '@tmlmobilidade/ui';

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
			<CoordinatesInput
				description="Ponto de referência do alerta, para que seja possível localizar o alerta no mapa."
				{...realtimeContext.data.form.getInputProps('coordinates')}
			/>
		</Section>
	);
}
