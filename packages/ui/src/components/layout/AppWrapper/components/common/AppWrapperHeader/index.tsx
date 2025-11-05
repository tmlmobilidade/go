'use client';

/* * */

import { Label } from '@/components/display/Label';
import { Section } from '@/components/layout/Section';
import { Spacer } from '@/components/layout/Spacer';
import { Skeleton } from '@mantine/core';
import { useState } from 'react';

import styles from './styles.module.css';

import { ExportsMenu, NotificationsMenu, OptionsMenu } from '../../menus';

/* * */

const AVAILABLE_GREETINGS = ['Olá', 'Hi', 'Hey', 'Oi', 'Hallo', 'Hola', 'Ciao', 'Hej'];

/* * */

interface AppWrapperHeaderProps {
	userName?: string
}

/* * */

export function AppWrapperHeader({ userName }: AppWrapperHeaderProps) {
	//

	//
	// A. Setup variables

	const [drawnGreeting] = useState(AVAILABLE_GREETINGS[(AVAILABLE_GREETINGS.length * Math.random()) | 0]);

	//
	// B. Render components

	if (!userName) {
		return (
			<div className={styles.container}>
				<Skeleton h={18} w={120} />
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Label size="md" caps singleLine>{drawnGreeting} {userName}</Label>
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
