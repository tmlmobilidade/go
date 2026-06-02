'use client';

import { FloatingHelpButtonModal } from '@/components/viewport/FloatingHelpButtonModal';
import { IconHelpSmall } from '@tabler/icons-react';
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
			<div className={styles.button} onClick={() => setIsOpen(true)}>
				<IconHelpSmall size={50} />
			</div>
			<FloatingHelpButtonModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
