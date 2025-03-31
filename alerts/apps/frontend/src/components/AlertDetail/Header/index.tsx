'use client';

import BackButton from '@/components/common/BackButton';
import {
	AlertDetailMode,
	useAlertDetailContext,
} from '@/contexts/AlertDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { Button, Label, Spacer, Tag } from '@tmlmobilidade/ui';

export default function Header() {
	const { actions, data, flags } = useAlertDetailContext();

	return (
		<>
			<BackButton />
			<Tag label={data.form.getValues().publish_status} variant={data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Label size="lg" caps>{data.form.getValues()._id}</Label>
			<Spacer />
			<Button
				label="Salvar como rascunho"
				onClick={() => actions.saveAlert('draft')}
				variant="secondary"
			/>
			<Button
				disabled={!flags.canSave || flags.isSaving}
				icon={<IconUpload size={28} />}
				loading={flags.isSaving}
				onClick={() => actions.saveAlert('publish')}
				variant="primary"
				label={
					flags.mode === AlertDetailMode.CREATE
						? 'Publicar'
						: 'Salvar'
				}
			/>
			{flags.mode === AlertDetailMode.EDIT && (
				<Button
					disabled={flags.isSaving}
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={actions.deleteAlert}
					variant="danger"
				/>
			)}
		</>
	);
}
