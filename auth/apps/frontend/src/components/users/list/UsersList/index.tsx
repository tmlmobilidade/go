'use client';

/* * */

import { useUsersListContext } from '@/contexts/UsersList.context';
import { Routes } from '@/lib/routes';
import { Loader, Pane, Section, Tag, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

import { UsersListHeader } from '../UsersListHeader';

/* * */

export function UsersList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, flags } = useUsersListContext();

	//
	// B. Render components

	if (flags.loading) {
		return <Loader />;
	}
	else if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<UsersListHeader />,
		]}
		>
			{data.filtered.map(user => (
				<div key={user._id} className={styles.root} onClick={() => router.push(Routes.USER_DETAIL(user._id))}>
					<Section alignItems="center" flexDirection="row" flexWrap="nowrap" gap="sm">
						<Tag label={user._id} variant="muted" />
						<Text size="lg">{user.first_name} {user.last_name}</Text>
					</Section>
				</div>
			))}
		</Pane>
	);

	//
}
