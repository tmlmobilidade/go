'use client';

import BackButton from '@/components/common/BackButton';
import { RoleDetailMode, useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { Badge, Button, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

export default function Header() {
	const { actions, data, flags } = useRoleDetailContext();

	return (
		<Surface alignItems="center" flexDirection="row" justifyContent="space-between" padding="sm">
			<div className={styles.headerContainer}>
				<BackButton />
				<Badge variant="muted">{data.id || 'Novo Utilizador'}</Badge>
			</div>
			<div className={styles.headerContainer}>
				<Button disabled={!flags.canSave} icon={<IconUpload size={28} />} label={flags.mode === RoleDetailMode.CREATE ? 'Publicar' : 'Salvar'} loading={flags.isSaving} onClick={actions.saveRole} variant="primary" />
				{flags.mode === RoleDetailMode.EDIT && (
					<Button icon={<IconTrash size={28} />} label="Apagar" onClick={actions.deleteRole} variant="danger" />
				)}
			</div>
		</Surface>
	);
}
