'use client';

/* * */

import { Label } from '@/components/display/Label';
import { Section } from '@/components/layout/Section';
import { Spacer } from '@/components/layout/Spacer';
import { useMeContext } from '@/contexts';
import { Skeleton } from '@mantine/core';
import { useState } from 'react';

import styles from './styles.module.css';

import { ExportsMenu } from '../ExportsMenu';
import { NotificationsMenu } from '../NotificationsMenu';
import { OptionsMenu } from '../OptionsMenu';

/* * */

const AVAILABLE_GREETINGS = ['Olá', 'Hi', 'Hey', 'Oi', 'Hallo', 'Hola', 'Ciao', 'Hej'];

/* * */

export function AppTopbar() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [drawnGreeting] = useState(AVAILABLE_GREETINGS[(AVAILABLE_GREETINGS.length * Math.random()) | 0]);

	//
	// B. Render components

	if (!meContext.data.user?.first_name) {
		return (
			<div className={styles.container}>
				<Skeleton h={18} w={120} />
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Label size="md" caps singleLine>{drawnGreeting} {meContext.data.user.first_name}</Label>
			<Spacer />
			<Section flexDirection="row" gap="xs" width="fit-content">
				<ExportsMenu />
				<NotificationsMenu />
				<OptionsMenu />
			</Section>
		</div>
	);

	//
}
