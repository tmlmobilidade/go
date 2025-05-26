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
		console.log('New Stop');
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

	const downloadStopsEsri = () => {
		// Header Line
		const keys = Object.keys(data.stops[0]);
		let headerLine = keys.join(', ') + "\n";
		headerLine = headerLine.replace('_id', 'stop_id');
		headerLine = headerLine.replace('name', 'stop_name');
		headerLine = headerLine.replace('short_name', 'stop_short_name');
		headerLine = headerLine.replace('tts_name', 'stop_tts_name');
		headerLine = headerLine.replace('latitude', 'stop_lat, y');
		headerLine = headerLine.replace('longitude', 'stop_lon, x');

		// Values Lines
		let valuesLines = "";
		for (let stop of data.stops) {
			for (let key in stop) {
				valuesLines += stop[key] + ', ';
				if (key === 'latitude' || key === 'longitude') {
					valuesLines += stop[key] + ', ';
				}
			}
			valuesLines += '\n';
		}

		const textContent = headerLine + valuesLines;

		const blob = new Blob([textContent], { type: 'application/txt' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'esri.txt';
		link.click();

		URL.revokeObjectURL(url); // Clean up
	};

	const items = [
		{ onClick: () => handleNewStop(), title: '+ Nova Paragem' },
		{ onClick: () => downloadStopsJson(), title: 'Exportar stops.json' },
		{ onClick: () => downloadStopsTxt(), title: 'Exportar stops.txt' },
		{ onClick: () => alert("deleted_stops.json"), title: 'Exportar deleted_stops.json' },
		{ onClick: () => alert("deleted_stops.txt"), title: 'Exportar deleted_stops.txt' },
		{ onClick: () => alert("linhas"), title: 'Exportar Linhas por Paragem' },
		{ onClick: () => downloadStopsEsri(), title: 'Exportar para ESRI' },
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
