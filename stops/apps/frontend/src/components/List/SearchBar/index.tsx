'use client';

import { useLinesContext } from '@/contexts/Lines.context';
import { useSearchbarContext } from '@/contexts/Searchbar.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { Routes } from '@/lib/routes';
import { IconCloudDown, IconDots, IconFileArrowRight, IconPlus } from '@tabler/icons-react';
import { Menu, TextInput } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function SearchBar() {
	//

	//
	// A. Render components
	const stopsContext = useStopsContext();
	const searchBarContext = useSearchbarContext();
	const router = useRouter();
	const linesContext = useLinesContext();
	const stops = useStopsContext();
	const stopsList = useStopsListContext();
	const lines = useLinesContext();

	//
	// B. Transform data
	const handleNewStop = () => {
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

	const syncDBs = () => {
		stops.actions.handleDBSync();
		stopsList.actions.handleDBSync();
		lines.actions.handleDBSync();
	};

	//
	// C. Render components
	return (
		<div className={styles.container}>
			<TextInput
				className={styles.inputText}
				maxLength={255}
				onChange={e => searchBarContext.setQueryString(e.target.value)}
				placeholder="Pesquisar..."
			/>

			<Menu shadow="md" width={200}>
				<Menu.Target>
					<div className={styles.icon}>
						<IconDots />
					</div>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>Paragens</Menu.Label>

					<Menu.Item leftSection={<IconPlus size={14} />}>
						<div onClick={() => handleNewStop()}>Nova Paragem</div>
					</Menu.Item>

					<Menu.Divider />

					<Menu.Label>Exportações</Menu.Label>

					<Menu.Item leftSection={<IconFileArrowRight size={14} />}>
						<div onClick={() => downloadStopsJson()}>stops.json</div>
					</Menu.Item>

					<Menu.Item leftSection={<IconFileArrowRight size={14} />}>
						<div onClick={() => downloadStopsTxt()}>stops.txt</div>
					</Menu.Item>

					<Menu.Item leftSection={<IconFileArrowRight size={14} />}>
						<div onClick={() => downloadDeletedStopsJson()}>deleted_stops.json</div>
					</Menu.Item>

					<Menu.Item leftSection={<IconFileArrowRight size={14} />}>
						<div onClick={() => downloadDeletedStopsTxt()}>deleted_stops.txt</div>
					</Menu.Item>

					<Menu.Item leftSection={<IconFileArrowRight size={14} />}>
						<div onClick={() => downloadLinesJson()}>Linhas por Paragem</div>
					</Menu.Item>

					<Menu.Item leftSection={<IconFileArrowRight size={14} />}>
						<div onClick={() => downloadStopsEsri()}>ESRI</div>
					</Menu.Item>

					<Menu.Divider />

					<Menu.Label>Sincronizações</Menu.Label>

					<Menu.Item leftSection={<IconCloudDown size={14} />}>
						<div onClick={() => syncDBs()}>Bases de Dados</div>
					</Menu.Item>

				</Menu.Dropdown>
			</Menu>
		</div>
	);
}
