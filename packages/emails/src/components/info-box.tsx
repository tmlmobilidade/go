import { Section } from '@react-email/components';
import React from 'react';

import styles from './styles.js';

export interface InfoBoxProps {
	children: React.ReactNode
	variant?: 'error' | 'info' | 'success' | 'warning'
}

export function InfoBox({ children, variant = 'info' }: InfoBoxProps) {
	const colorScheme = styles.colors[variant];

	const infoBoxStyle: React.CSSProperties = {
		...styles.text,
		backgroundColor: colorScheme.background,
		border: `1px solid ${colorScheme.border}`,
		borderRadius: '6px',
		margin: '16px 0',
		padding: '16px',
	};

	return (
		<Section style={infoBoxStyle}>
			{children}
		</Section>
	);
}
