'use client';

import { Routes } from '@/lib/routes';
import { Button } from '@mantine/core';
import { IconMapPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import styles from './styles.module.css';

enum Phase {
	CONFIRMATION = 'CONFIRMATION',
	IDENTIFICATION = 'IDENTIFICATION',
	LOCATION = 'LOCATION',
}

export function NavigationButtons({ actions, data, phase, setPhase }) {
	//

	//
	// A. Setup Variables
	const router = useRouter();

	//
	// B. Render components
	return (
		<div className={styles.container}>
			{phase === Phase.LOCATION
			&& (
				<Button className={styles.button} onClick={() => router.push(Routes.STOP_LIST)}>
					Cancelar
				</Button>
			)}

			{phase === Phase.IDENTIFICATION
			&& (
				<Button className={styles.button} onClick={() => setPhase(Phase.LOCATION)}>
					Voltar
				</Button>
			)}

			{phase === Phase.CONFIRMATION
			&& (
				<Button className={styles.button} onClick={() => setPhase(Phase.IDENTIFICATION)}>
					Voltar
				</Button>
			)}

			{phase === Phase.LOCATION
			&& (
				<Button className={styles.button} disabled={data.form.getValues().latitude === 0 || data.form.getValues().longitude === 0} onClick={() => setPhase(Phase.IDENTIFICATION)}>
					Avançar
				</Button>
			)}

			{phase === Phase.IDENTIFICATION
			&& (
				<Button className={styles.button} disabled={data.form.getValues()._id === 'temp' || data.form.getValues().name === 'temp' || data.form.getValues().short_name === 'temp'} onClick={() => setPhase(Phase.CONFIRMATION)}>
					{/* <Button className={styles.button} onClick={() => setPhase(Phase.CONFIRMATION)} disabled={data.form.getValues()._id === "temp" || data.form.getValues().name === 'temp' || data.form.getValues().short_name === "temp" || data.form.getValues().locality_id === "temp"}> */}
					Avançar
				</Button>
			)}

			{phase === Phase.CONFIRMATION
			&& (
				<Button
					className={styles.button}
					onClick={() => {
						actions.saveStop();
						router.push(Routes.STOP_DETAIL('new'));
						// router.push(Routes.STOP_LIST);
					}}
				>
					<IconMapPlus />
					Criar Paragem
				</Button>
			)}
		</div>
	);
}
