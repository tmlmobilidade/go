'use client';

import { Anchor, Breadcrumbs } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { TextInput } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function SearchBar({ data, setQueryString }) {
	//

	//
	// A. Render components

	const [isOpen, setIsOpen] = useState(false);

	//
	// B. Transform data

	const downloadJSON = () => {
		const jsonStr = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'stops.json';
		link.click();

		URL.revokeObjectURL(url); // Clean up
	};

	const items = [
		{ onClick: () => downloadJSON(), title: 'Exportar stops.json' },
		// { href: '#', title: 'Exportar deleted_stops.txt' },
		// { href: '#', title: 'Exportar Linhas por Paragem' },
		// { href: '#', title: 'Exportar para ESRI' },
	].map((item, index) => (
		<Anchor key={index} onClick={item.onClick}>
			{item.title}
		</Anchor>
	));

	//
	// C. Render components

	return (
		<div className={styles.container}>
			{/* Search Bar */}
			<TextInput
				className={styles.inputText}
				maxLength={255}
				onChange={e => setQueryString(e.target.value)}
				placeholder="Pesquisar..."
			/>

			{/* Settings Button */}
			<div className={styles.icon} onClick={() => setIsOpen((isOpen: boolean) => !isOpen)}>
				<IconDots />
				{isOpen && <Breadcrumbs className={styles.breadcrumbs}>{items}</Breadcrumbs>}
			</div>
		</div>
	);
}
