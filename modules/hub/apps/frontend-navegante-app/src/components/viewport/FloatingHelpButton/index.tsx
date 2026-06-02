'use client';

import { FloatingHelpButtonModal } from '@/components/viewport/FloatingHelpButtonModal';
import { ActionIcon, Affix } from '@mantine/core';
import { IconHelpCircle } from '@tabler/icons-react';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function FloatingHelpButton() {
	//

	//
	// A. Setup variables

	const [isOpen, setIsOpen] = useState<boolean>(false);

	//
	// B. Render components

	return (
		<>
			<Affix className={styles.affix} zIndex={200}>
				<ActionIcon
					classNames={{ root: styles.button }}
					onClick={() => setIsOpen(true)}
					variant="muted"
				>
					<IconHelpCircle color="var(--color-system-text-100)" size={24} />
				</ActionIcon>
			</Affix>
			<FloatingHelpButtonModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
