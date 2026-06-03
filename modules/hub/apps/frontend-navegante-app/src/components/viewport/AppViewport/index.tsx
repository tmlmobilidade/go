'use client';

import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { LinesDetailContextProvider } from '@/components/lines/detail/LinesDetail.context';
import { FloatingHelpButton } from '@/components/viewport/FloatingHelpButton';
import { Navbar } from '@/components/viewport/Navbar';
import { Button, Drawer } from '@mantine/core';
import { useColorScheme, useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';

import styles from './styles.module.css';

/* * */

export function AppViewport() {
	//

	//
	// A. Setup variables

	const colorScheme = useColorScheme();

	const [opened, { close, open }] = useDisclosure(false);

	//
	// B. Handle actions

	useEffect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-mode', colorScheme);
		document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
	}, [colorScheme]);

	//
	// C. Render components

	return (
		<>
			<div className={styles.viewport}>
				<Navbar />
			</div>
			<FloatingHelpButton />

			<Drawer
				onClose={close}
				opened={opened}
				padding={0}
				position="bottom"
				size="95%"
				withCloseButton={false}
			>
				<LinesDetailContextProvider lineId="[41]1004">
					<LinesDetail />
				</LinesDetailContextProvider>
			</Drawer>

			<Button onClick={open} variant="default">
				Open Drawer
			</Button>
		</>
	);
}
