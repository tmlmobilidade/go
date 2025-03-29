'use client';

/* * */

import BackButton from '@/components/common/BackButton';
import { UsersDetailMode, useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { Button, Spacer, Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function UsersDetailHeader() {
	//

	//
	// A. Setup variables

	const usersDetailContext = useUsersDetailContext();

	//
	// B. Render components

	return (
		<div className={styles.headerContainer}>
			<BackButton />
			<Tag label={usersDetailContext.data.id || 'Novo Utilizador'} variant="muted" />
			<Spacer />
			<div>
				<Button
					disabled={!usersDetailContext.flags.canSave}
					icon={<IconUpload size={28} />}
					label={usersDetailContext.flags.mode === UsersDetailMode.CREATE ? 'Publicar' : 'Guardar'}
					loading={usersDetailContext.flags.isSaving}
					onClick={usersDetailContext.actions.saveUser}
					variant="primary"
				/>
			</div>
			<div>
				{usersDetailContext.flags.mode === UsersDetailMode.EDIT && (
					<Button
						icon={<IconTrash size={28} />}
						label="Apagar"
						onClick={usersDetailContext.actions.deleteUser}
						variant="danger"
					/>
				)}
			</div>
		</div>
	);

	//
}
