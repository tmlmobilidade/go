'use client';

import { Anchor, Breadcrumbs } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { TextInput } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';
import { Routes } from '@/lib/routes';
import { useRouter } from 'next/navigation';

/* * */

export function SearchBar({ data, setQueryString }) {
	//

	//
	// A. Render components

	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	//
	// B. Transform data

	const handleNewStop = () => {
		router.push(Routes.STOP_DETAIL('new'));
	}

	const downloadStopsJson = () => {
		const jsonStr = JSON.stringify(data.stops, null, 2);
		const blob = new Blob([jsonStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'stops.json';
		link.click();

		URL.revokeObjectURL(url); // Clean up
	};

	const downloadStopsTxt = () => {
		const keys = Object.keys(data.stops[0]);
		const headerLine = keys.join(', ') + "\n";
		const valuesLines = data.stops.map((stop) => Object.values(stop).join(', ')).join('\n');
		const textContent = headerLine + valuesLines;
		
		const blob = new Blob([textContent], { type: 'application/txt' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'stops.txt';
		link.click();

		URL.revokeObjectURL(url); // Clean up
	};

	const items = [
		{ onClick: () => handleNewStop(), title: '+ Nova Paragem' },
		{ onClick: () => downloadStopsJson(), title: 'Exportar stops.json' },
		{ onClick: () => downloadStopsTxt(), title: 'Exportar stops.txt' },
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
