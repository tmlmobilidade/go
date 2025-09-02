import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { CoordinatesInput, Label, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

export function AlertBasicInfo() {
	const realtimeContext = useRealtimeCreateContext();

	return (
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
		</Section>
	);
}
