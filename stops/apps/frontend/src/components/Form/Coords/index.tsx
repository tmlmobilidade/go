'use client';

import { ActionIcon, Tooltip } from '@mantine/core';
import { IconCopy, IconMap, IconUpload, IconWorld } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import Link from 'next/link';
import React from 'react';

import styles from './styles.module.css';

export function Coords({ latitude, longitude, municipality, municipality_id }: { latitude: number, longitude: number, municipality: null | string, municipality_id: string }) {
	//

	//
	// A. Setup Variables

	const [copiedLat, setCopiedLat] = React.useState(false);
	const [copiedLon, setCopiedLon] = React.useState(false);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(latitude.toString() + ', ' + longitude.toString())
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
						<div className={styles.subSection}>#{municipality_id} {municipality}</div>
						<div className={styles.subSection}>
							<Button
								className={styles.button}
								icon={<IconWorld size={16} />}
								label={copiedLat ? 'Latitude Copiada' : `Lat: ${latitude}`}
								variant="primary"
								onClick={() => {
									navigator.clipboard.writeText(latitude.toString())
										.then(() => console.log('Copied to clipboard!'))
										.catch(err => console.error('Failed to copy: ', err));
									setCopiedLat(true);
								}}
							/>
							<Button
								className={styles.button}
								icon={<IconWorld size={16} />}
								label={copiedLon ? 'Longitude Copiada' : `Lon: ${longitude}`}
								variant="primary"
								onClick={() => {
									navigator.clipboard.writeText(longitude.toString())
										.then(() => console.log('Copied to clipboard!'))
										.catch(err => console.error('Failed to copy: ', err));
									setCopiedLon(true);
								}}
							/>
						</div>
						<div className={styles.subSection}>
							<Tooltip label="Copiar Coordenadas" position="bottom">
								<ActionIcon
									onClick={() => copyToClipboard()}
									variant="secondary"
								>
									<IconCopy />
								</ActionIcon>
							</Tooltip>
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
								icon={<IconWorld size={16} />}
								label={copiedLat ? 'Latitude Copiada' : `Lat: ${latitude}`}
								variant="primary"
								onClick={() => {
									navigator.clipboard.writeText(latitude.toString())
										.then(() => console.log('Copied to clipboard!'))
										.catch(err => console.error('Failed to copy: ', err));
									setCopiedLat(true);
								}}
							/>
							<Button
								className={styles.button}
								icon={<IconWorld size={16} />}
								label={copiedLon ? 'Longitude Copiada' : `Lon: ${longitude}`}
								variant="primary"
								onClick={() => {
									navigator.clipboard.writeText(longitude.toString())
										.then(() => console.log('Copied to clipboard!'))
										.catch(err => console.error('Failed to copy: ', err));
									setCopiedLon(true);
								}}
							/>
						</div>
						<div className={styles.subSection}>
							<Tooltip label="Copiar Coordenadas" position="bottom">
								<ActionIcon
									onClick={() => copyToClipboard()}
									variant="secondary"
								>
									<IconCopy />
								</ActionIcon>
							</Tooltip>
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
