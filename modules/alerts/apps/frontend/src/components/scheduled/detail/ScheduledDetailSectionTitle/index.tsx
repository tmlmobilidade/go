'use client';

/* * */

import { UploadImage } from '@/components/common/UploadImage';
import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { IconLink } from '@tabler/icons-react';
import { Collapsible, CoordinatesInput, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function ScheduledDetailSectionTitle() {
	//

	//
	// A. Setup variables

	const scheduledDetailContext = useScheduledDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Breve descrição do que motivou a criação do alerta"
			title="Título e Descrição"
		>
			<Section gap="md">
				<TextInput
					key={scheduledDetailContext.data.form.key('title')}
					description="É importante que o título seja curto e claro, para que não apareça cortado no site, apps, etc."
					label="Título Curto"
					maxLength={255}
					withAsterisk
					{...scheduledDetailContext.data.form.getInputProps('title')}
				/>
				<Textarea
					key={scheduledDetailContext.data.form.key('description')}
					description="Um bom alerta explica a situação de forma breve e clara, explicita as suas causas e como está a ser mitigado, e apresenta uma ou mais soluções de como o passageiro poderá ultrapassar esta situação."
					label="Descrição"
					maxRows={10}
					minRows={4}
					autosize
					withAsterisk
					{...scheduledDetailContext.data.form.getInputProps('description')}
				/>
				<UploadImage
					imageUrl={scheduledDetailContext.data.image?.url}
					label="Imagem"
					onDelete={scheduledDetailContext.actions.deleteImage}
					onFileChange={scheduledDetailContext.actions.fileChanged}
				/>
				<CoordinatesInput
					key={scheduledDetailContext.data.form.key('coordinates')}
					description="Ponto de referência do alerta, para que seja possível localizar o alerta no mapa."
					{...scheduledDetailContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					key={scheduledDetailContext.data.form.key('info_url')}
					description="Opcionalmente inclua o URL de um website onde é possivel obter mais informação"
					label="Link Adicional"
					leftSection={<IconLink size={18} />}
					placeholder="https://www.cm-setubal.com/..."
					{...scheduledDetailContext.data.form.getInputProps('info_url')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
