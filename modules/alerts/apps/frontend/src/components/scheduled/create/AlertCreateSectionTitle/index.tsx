'use client';

/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { CreateAlertSchema } from '@tmlmobilidade/types';
import { Collapsible, CoordinatesInput, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateSectionTitle() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Breve descrição do que motivou a criação do alerta"
			title="Título e Descrição"
		>
			<Section gap="md">
				<TextInput
					key={alertCreateContext.data.form.key('title')}
					description="É importante que o título seja curto e claro, para que não apareça cortado no site, apps, etc."
					label="Título Curto"
					maxLength={255}
					placeholder="..."
					withAsterisk
					{...alertCreateContext.data.form.getInputProps('title')}
				/>
				<Textarea
					key={alertCreateContext.data.form.key('description')}
					description="Um bom alerta explica a situação de forma breve e clara, explicita as suas causas e como está a ser mitigado, e apresenta uma ou mais soluções de como o passageiro poderá ultrapassar esta situação."
					label="Descrição"
					maxRows={10}
					minRows={4}
					placeholder="..."
					withAsterisk={!CreateAlertSchema.shape.description.isOptional()}
					autosize
					{...alertCreateContext.data.form.getInputProps('description')}
				/>
				<CoordinatesInput
					key={alertCreateContext.data.form.key('coordinates')}
					description="Ponto de referência do alerta, para que seja possível localizar o alerta no mapa."
					{...alertCreateContext.data.form.getInputProps('coordinates')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
