'use client';

import { UploadImage } from '@/components/common/UploadImage';
import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { IconLink } from '@tabler/icons-react';
import { Section, Surface, TextArea, TextInput } from '@tmlmobilidade/ui';

export default function AlertSectionTitle() {
	//

	//
	// A. Setup Variables
	const { actions, data: alertDetailData } = useAlertDetailContext();

	console.log('ALERT DETAIL DATA', alertDetailData);

	//
	// C. Render Components
	return (
		<Section
			description="Breve descrição do que motivou a criação do alerta"
			title="Título e Descrição"
		>
			<Surface gap="md" padding="sm">
				<TextInput
					description="É importante que o título seja curto e claro, para que não apareça cortado no site, apps, etc."
					label="Título Curto"
					maxLength={255}
					placeholder="..."
					withAsterisk
					{...alertDetailData.form.getInputProps('title')}
				/>
				<TextArea
					description="Um bom alerta explica a situação de forma breve e clara, explicita as suas causas e como está a ser mitigado, e apresenta uma ou mais soluções de como o passageiro poderá ultrapassar esta situação."
					label="Descrição"
					maxRows={10}
					minRows={4}
					placeholder="..."
					autosize
					withAsterisk
					{...alertDetailData.form.getInputProps('description')}
				/>
				<UploadImage
					imageUrl={alertDetailData.imageUrl}
					label="Imagem"
					onDelete={actions.deleteImage}
					onFileChange={actions.fileChanged}
				/>
				<TextInput
					description="Opcionalmente inclua o URL de um website onde é possivel obter mais informação"
					label="Link Adicional"
					leftSection={<IconLink size={18} />}
					placeholder="https://www.cm-setubal.com/..."
					{...alertDetailData.form.getInputProps('link')}
				/>
			</Surface>
		</Section>
	);
}
