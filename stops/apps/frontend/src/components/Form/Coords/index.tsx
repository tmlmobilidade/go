'use client';

import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { IconCopy, IconMap, IconMapPinFilled, IconWorld } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';

import styles from './styles.module.css';

export function Coords({ latitude, longitude, municipality }: { latitude: number, longitude: number, municipality: null | string }) {
	//

	//
	// A. Setup Variables

	const [copiedLat, setCopiedLat] = React.useState(false);
	const [copiedLon, setCopiedLon] = React.useState(false);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(latitude.toString() + longitude.toString())
			.then(() => console.log('Copied to clipboard!'))
			.catch(err => console.error('Failed to copy: ', err));
		setCopiedLat(true);
		setCopiedLon(true);
	};

	//
	// B. Render components
	return (
		<div className={styles.container}>
			{latitude && longitude ? (
				municipality ? (
					<div className={styles.section}>
						<div className={styles.subSection}>#01 {municipality}</div>
						<div className={styles.subSection}>
							<Button
								className={styles.button}
								onClick={() => {
									navigator.clipboard.writeText(latitude.toString())
										.then(() => console.log('Copied to clipboard!'))
										.catch(err => console.error('Failed to copy: ', err));
									setCopiedLat(true);
								}}
							>
								<IconWorld />
								{copiedLat ? 'Latitude Copiada' : `Lat: ${latitude}`}
							</Button>

							<Button
								className={styles.button}
								onClick={() => {
									navigator.clipboard.writeText(longitude.toString())
										.then(() => console.log('Copied to clipboard!'))
										.catch(err => console.error('Failed to copy: ', err));
									setCopiedLon(true);
								}}
							>
								<IconWorld />
								{copiedLon ? 'Longitude Copiada' : `Lon: ${longitude}`}
							</Button>
						</div>
						<div className={styles.subSection}>
							<Link href={`https://www.google.com/maps/@${latitude},${longitude}`} target="_blank">
								<Tooltip label="Copiar Coordenadas" position="bottom">
									<ActionIcon
										onClick={() => copyToClipboard()}
										variant="secondary"
									>
										<IconCopy />
									</ActionIcon>
								</Tooltip>
							</Link>
							<Link href={`https://www.google.com/maps/@${latitude},${longitude}`} target="_blank">
								<Tooltip label="Abrir no Google Maps" position="bottom">
									<ActionIcon
										variant="secondary"
									>
										<IconMap />
									</ActionIcon>
								</Tooltip>
							</Link>
						</div>
					</div>
				) : (
					<div className={styles.section}>
						<div className={styles.subSectionRed}>Calma, ainda não servimos esse município 😏</div>
						<div className={styles.subSection}>
							<Button
								className={styles.button}
								onClick={() => {
									navigator.clipboard.writeText(latitude.toString())
										.then(() => console.log('Copied to clipboard!'))
										.catch(err => console.error('Failed to copy: ', err));
									setCopiedLat(true);
								}}
							>
								<IconWorld />
								{copiedLat ? 'Latitude Copiada' : `Lat: ${latitude}`}
							</Button>

							<Button
								className={styles.button}
								onClick={() => {
									navigator.clipboard.writeText(longitude.toString())
										.then(() => console.log('Copied to clipboard!'))
										.catch(err => console.error('Failed to copy: ', err));
									setCopiedLon(true);
								}}
							>
								<IconWorld />
								{copiedLon ? 'Longitude Copiada' : `Lon: ${longitude}`}
							</Button>
						</div>
						<div className={styles.subSection}>
							<Link href={`https://www.google.com/maps/@${latitude},${longitude}`} target="_blank">
								<Tooltip label="Copiar Coordenadas" position="bottom">
									<ActionIcon
										onClick={() => copyToClipboard()}
										variant="secondary"
									>
										<IconCopy />
									</ActionIcon>
								</Tooltip>
							</Link>
							<Link href={`https://www.google.com/maps/@${latitude},${longitude}`} target="_blank">
								<Tooltip label="Abrir no Google Maps" position="bottom">
									<ActionIcon
										variant="secondary"
									>
										<IconMap />
									</ActionIcon>
								</Tooltip>
							</Link>
						</div>
					</div>
				)

			)
				: (<div>Selecione uma localização no mapa</div>)}
		</div>
	);
}
