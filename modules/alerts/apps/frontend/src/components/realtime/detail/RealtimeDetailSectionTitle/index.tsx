'use client';

/* * */

import { UploadImage } from '@/components/common/UploadImage';
import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { IconLink } from '@tabler/icons-react';
import { Collapsible, CoordinatesInput, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RealtimeDetailSectionTitle() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Breve descrição do que motivou a criação do realtimea"
			title="Título e Descrição"
		>
			<Section gap="md">
				<TextInput
					description="É importante que o título seja curto e claro, para que não apareça cortado no site, apps, etc."
					label="Título Curto"
					maxLength={255}
					placeholder="..."
					withAsterisk
					{...realtimeDetailContext.data.form.getInputProps('title')}
				/>
				<Textarea
					description="Um bom realtimea explica a situação de forma breve e clara, explicita as suas causas e como está a ser mitigado, e apresenta uma ou mais soluções de como o passageiro poderá ultrapassar esta situação."
					label="Descrição"
					maxRows={10}
					minRows={4}
					placeholder="..."
					autosize
					withAsterisk
					{...realtimeDetailContext.data.form.getInputProps('description')}
				/>
				{/* <UploadImage
					imageUrl={realtimeDetailContext.data.imageUrl?.url}
					label="Imagem"
					onDelete={realtimeDetailContext.actions.deleteImage}
					onFileChange={realtimeDetailContext.actions.fileChanged}
				/> */}
				<CoordinatesInput
					description="Ponto de referência do realtimea, para que seja possível localizar o realtimea no mapa."
					{...realtimeDetailContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					description="Opcionalmente inclua o URL de um website onde é possivel obter mais informação"
					label="Link Adicional"
					leftSection={<IconLink size={18} />}
					placeholder="https://www.cm-setubal.com/..."
					{...realtimeDetailContext.data.form.getInputProps('link')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
