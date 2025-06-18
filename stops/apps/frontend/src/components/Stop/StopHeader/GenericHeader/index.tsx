'use client';

import { ActionIcon } from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

export function GenericHeader() {
	//

	//
	// A. Render components
	return (
		<div className={styles.header}>
			<div className={styles.section}>
				<h3>All Stops</h3>
			</div>

			<div className={styles.section}>
				<Link href="https://www.google.com/maps/@38.6512317,-8.8813723,10z" target="_blank">
					<Tooltip label="Open in Google Maps" position="bottom">
						<ActionIcon
							className={styles.icon}
							variant="secondary"
						>
							<IconMapPinFilled />
						</ActionIcon>
					</Tooltip>
				</Link>

			</div>
		</div>
	);
}
