'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { CreateAlertSchema } from '@tmlmobilidade/types';
import { Grid, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function ScheduledAlertCreateSectionTitle() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();

	//
	// B. Render components

	return (
		<Section>
			<Grid gap="md">
				<TextInput
					key={scheduledAlertCreateContext.data.form.key('title')}
					description="É importante que o título seja curto e claro, para que não apareça cortado no site, apps, etc."
					label="Título Curto"
					maxLength={255}
					data-autofocus
					withAsterisk
					{...scheduledAlertCreateContext.data.form.getInputProps('title')}
				/>
				<Textarea
					key={scheduledAlertCreateContext.data.form.key('description')}
					description="Um bom alerta explica a situação de forma breve e clara, explicita as suas causas e como está a ser mitigado, e apresenta uma ou mais soluções de como o passageiro poderá ultrapassar esta situação."
					label="Descrição"
					maxRows={10}
					minRows={4}
					withAsterisk={!CreateAlertSchema.shape.description.isOptional()}
					autosize
					{...scheduledAlertCreateContext.data.form.getInputProps('description')}
				/>
			</Grid>
		</Section>
	);

	//
}
