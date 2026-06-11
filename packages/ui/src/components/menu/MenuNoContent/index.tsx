'use client';

/* * */

import React from 'react';

import { Section } from '../../layout/Section';

/* * */

interface MenuNoContentProps {
	icon: React.ElementType
	text: string
}

export function MenuNoContent({ icon, text }: MenuNoContentProps) {
	//

	//
	// A. Render components

	return (
		<Section alignItems="center" gap="sm" justifyContent="center">
			{React.createElement(icon, { color: 'var(--color-system-text-200)', size: 32 })}
			<span style={{ color: 'var(--color-system-text-200)', fontSize: 'var(--font-size-md)' }}>{text}</span>
		</Section>
	);
}
