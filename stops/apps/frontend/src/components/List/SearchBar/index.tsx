'use client';

import { useLinesContext } from '@/contexts/Lines.context';
import { useSearchbarContext } from '@/contexts/Searchbar.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { Routes } from '@/lib/routes';
import { Anchor, Breadcrumbs } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { TextInput } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function SearchBar() {
	//

	//
	// A. Render components

	const stopsContext = useStopsContext();
	const searchBarContext = useSearchbarContext();
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const linesContext = useLinesContext();
	const stops = useStopsContext();
	const stopsList = useStopsListContext();
	const lines = useLinesContext();

	//
	// B. Transform data

	const handleNewStop = () => {
		console.log('New Stop');
		router.push(Routes.STOP_DETAIL('new'));
	};

	const downloadStopsJson = () => {
		const stops = stopsContext.data.stops.filter(stop => stop.is_archived === false);
		const jsonStr = JSON.stringify(stops, null, 2);
		const blob = new Blob([jsonStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'stops.json';
		link.click();

		URL.revokeObjectURL(url); // Clean up
	};

	const downloadDeletedStopsJson = () => {
		const stops = stopsContext.data.stops.filter(stop => stop.is_archived === true);
		const jsonStr = JSON.stringify(stops, null, 2);
		const blob = new Blob([jsonStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'stops.json';
		link.click();

		URL.revokeObjectURL(url); // Clean up
	};

	const downloadStopsTxt = () => {
		const keys = Object.keys(stopsContext.data.stops[0]);
		const stops = stopsContext.data.stops.filter(stop => stop.is_archived === false);
		const headerLine = keys.join(', ') + '\n';
		const valuesLines = stops.map(stop => Object.values(stop).join(', ')).join('\n');
		const textContent = headerLine + valuesLines;

		const blob = new Blob([textContent], { type: 'application/txt' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'stops.txt';
		link.click();

		URL.revokeObjectURL(url); // Clean up
	};

	const downloadDeletedStopsTxt = () => {
		const keys = Object.keys(stopsContext.data.stops[0]);
		const stops = stopsContext.data.stops.filter(stop => stop.is_archived === true);
		const headerLine = keys.join(', ') + '\n';
		const valuesLines = stops.map(stop => Object.values(stop).join(', ')).join('\n');
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
		const keys = Object.keys(stopsContext.data.stops[0]);
		const stops = stopsContext.data.stops.filter(stop => stop.is_archived === false);
		let headerLine = keys.join(', ') + '\n';
		headerLine = headerLine.replace('_id', 'stop_id');
		headerLine = headerLine.replace('name', 'stop_name');
		headerLine = headerLine.replace('short_name', 'stop_short_name');
		headerLine = headerLine.replace('tts_name', 'stop_tts_name');
		headerLine = headerLine.replace('latitude', 'stop_lat, y');
		headerLine = headerLine.replace('longitude', 'stop_lon, x');

		// Values Lines
		let valuesLines = '';
		for (const stop of stops) {
			for (const key in stop) {
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

	const downloadLinesJson = () => {
		const keys = Object.keys(stopsContext.data.stops[0]);
		const headerLine = keys.join(', ') + '\n';
		const valuesLines = linesContext.data.lines.map(line => Object.values(line).join(', ')).join('\n');
		const textContent = headerLine + valuesLines;

		const blob = new Blob([textContent], { type: 'application/txt' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'lines.json';
		link.click();

		URL.revokeObjectURL(url); // Clean up
	};

	const syncStops = () => {
		stops.actions.handleDBSync();
		stopsList.actions.handleDBSync();
	};

	const syncLines = () => {
		lines.actions.handleDBSync();
	};

	const items = [
		{ onClick: () => handleNewStop(), title: '+ Nova Paragem' },
		{ onClick: () => downloadStopsJson(), title: 'Exportar stops.json' },
		{ onClick: () => downloadStopsTxt(), title: 'Exportar stops.txt' },
		{ onClick: () => downloadDeletedStopsJson(), title: 'Exportar deleted_stops.json' },
		{ onClick: () => downloadDeletedStopsTxt(), title: 'Exportar deleted_stops.txt' },
		{ onClick: () => downloadLinesJson(), title: 'Exportar Linhas por Paragem' },
		{ onClick: () => downloadStopsEsri(), title: 'Exportar para ESRI' },
		{ onClick: () => syncStops(), title: 'Sincronizar Paragens' },
		{ onClick: () => syncLines(), title: 'Sincronizar Linhas' },
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
				onChange={e => searchBarContext.setQueryString(e.target.value)}
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
