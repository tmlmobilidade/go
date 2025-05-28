'use client';

import React from 'react';
import styles from './styles.module.css';
import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { IconCopy, IconMap, IconMapPinFilled, IconWorld } from '@tabler/icons-react';
import Link from 'next/link';

export function Coords({ lat, lon, municipality }: { lat: number; lon: number, municipality: string | null }) {
    const [copiedLat, setCopiedLat] = React.useState(false);
    const [copiedLon, setCopiedLon] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(lat.toString() + lon.toString())
            .then(() => console.log("Copied to clipboard!"))
            .catch(err => console.error("Failed to copy: ", err));
        setCopiedLat(true);
        setCopiedLon(true);
    };

    // A. Render components
    return (
        <div className={styles.container}>
            {lat && lon ? (
                municipality ? (
                    <div className={styles.section}>
                        <div className={styles.subSection}>#01 {municipality}</div>
                        <div className={styles.subSection}>
                            <Button className={styles.button} onClick={() => {
                                navigator.clipboard.writeText(lat.toString())
                                    .then(() => console.log("Copied to clipboard!"))
                                    .catch(err => console.error("Failed to copy: ", err));
                                setCopiedLat(true)
                            }}>
                                <IconWorld />
                                {copiedLat ? "Latitude Copiada" : `Lat: ${lat}`}
                            </Button>

                            <Button className={styles.button} onClick={() => {
                                navigator.clipboard.writeText(lon.toString())
                                    .then(() => console.log("Copied to clipboard!"))
                                    .catch(err => console.error("Failed to copy: ", err));
                                setCopiedLon(true)
                            }}>
                                <IconWorld />
                                {copiedLon ? "Longitude Copiada" : `Lon: ${lon}`}
                            </Button>
                        </div>
                        <div className={styles.subSection}>
                            <Link href={`https://www.google.com/maps/@${lat},${lon}`} target="_blank">
                                <Tooltip label="Copiar Coordenadas" position="bottom">
                                    <ActionIcon
                                        variant="secondary"
                                        onClick={() => copyToClipboard()}
                                    >
                                        <IconCopy />
                                    </ActionIcon>
                                </Tooltip>
                            </Link>
                            <Link href={`https://www.google.com/maps/@${lat},${lon}`} target="_blank">
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
                            <Button className={styles.button} onClick={() => {
                                navigator.clipboard.writeText(lat.toString())
                                    .then(() => console.log("Copied to clipboard!"))
                                    .catch(err => console.error("Failed to copy: ", err));
                                setCopiedLat(true)
                            }}>
                                <IconWorld />
                                {copiedLat ? "Latitude Copiada" : `Lat: ${lat}`}
                            </Button>

                            <Button className={styles.button} onClick={() => {
                                navigator.clipboard.writeText(lon.toString())
                                    .then(() => console.log("Copied to clipboard!"))
                                    .catch(err => console.error("Failed to copy: ", err));
                                setCopiedLon(true)
                            }}>
                                <IconWorld />
                                {copiedLon ? "Longitude Copiada" : `Lon: ${lon}`}
                            </Button>
                        </div>
                        <div className={styles.subSection}>
                            <Link href={`https://www.google.com/maps/@${lat},${lon}`} target="_blank">
                                <Tooltip label="Copiar Coordenadas" position="bottom">
                                    <ActionIcon
                                        variant="secondary"
                                        onClick={() => copyToClipboard()}
                                    >
                                        <IconCopy />
                                    </ActionIcon>
                                </Tooltip>
                            </Link>
                            <Link href={`https://www.google.com/maps/@${lat},${lon}`} target="_blank">
                                <Tooltip label="Abrir no Google Maps" position="bottom">
                                    <ActionIcon
                                        variant="secondary"
                                    >
                                        <IconMap />
                                    </ActionIcon>
                                </Tooltip>
                            </Link>
                        </div>
                    </div>)

            ) :
                (<div>Selecione uma localização no mapa</div>)
            }
        </div >
    );
}