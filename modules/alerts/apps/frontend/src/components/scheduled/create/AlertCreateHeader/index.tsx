'use client';

/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

interface AlertCreateHeaderProps {
	onClose?: () => void
}

export function AlertCreateHeader({ onClose }: AlertCreateHeaderProps) {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={onClose} type="close" />
			<Tag label="Novo Alerta" variant="secondary" />
			<Spacer />
			<Button
				disabled={!alertCreateContext.data.form.values.title}
				icon={<IconUpload size={28} />}
				label="Salvar como rascunho"
				loading={alertCreateContext.flags.isSaving}
				onClick={() => alertCreateContext.actions.saveAlert('draft')}
				variant="secondary"
			/>
			<Button
				disabled={!alertCreateContext.data.form.values.title}
				icon={<IconUpload size={28} />}
				label="publicar"
				loading={alertCreateContext.flags.isSaving}
				onClick={() => alertCreateContext.actions.saveAlert('publish')}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
