'use client';

/* * */

import { RealtimeDetailMode, useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RealtimeDetailHeader() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// C. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{realtimeDetailContext.data.id}</Label>
			<Tag label={realtimeDetailContext.data.form.getValues().publish_status} variant={realtimeDetailContext.data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Spacer />
			<Button
				disabled={!realtimeDetailContext.flags.canSave || realtimeDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				loading={realtimeDetailContext.flags.isSaving}
				onClick={() => realtimeDetailContext.actions.saveAlert('publish')}
				variant="primary"
				label={
					realtimeDetailContext.flags.mode === RealtimeDetailMode.CREATE
						? 'Publicar'
						: 'Salvar'
				}
			/>
			{realtimeDetailContext.flags.mode === RealtimeDetailMode.EDIT && (
				<Button
					disabled={realtimeDetailContext.flags.isSaving}
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={realtimeDetailContext.actions.deleteAlert}
					variant="danger"
				/>
			)}
		</Toolbar>
	);

	//
}
