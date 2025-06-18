'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Routes } from '@/lib/routes';
import { IconMapPlus } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import React from 'react';

import styles from './styles.module.css';

enum Phase {
	CONFIRMATION = 'CONFIRMATION',
	IDENTIFICATION = 'IDENTIFICATION',
	LOCATION = 'LOCATION',
}

export function Buttons({ phase, setPhase }) {
	//

	//
	// A. Setup Variables
	const router = useRouter();
	const stopDetailsContext = useStopsDetailContext();

	//
	// B. Render components
	return (
		<div className={styles.container}>
			{phase === Phase.LOCATION
			&& (
				<Button className={styles.button} fullWidth={true} label="Cancelar" onClick={() => router.push(Routes.STOP_LIST)} />
			)}

			{phase === Phase.IDENTIFICATION
			&& (
				<Button className={styles.button} label="Voltar" onClick={() => setPhase(Phase.LOCATION)} />
			)}

			{phase === Phase.CONFIRMATION
			&& (
				<Button className={styles.button} label="Voltar" onClick={() => setPhase(Phase.IDENTIFICATION)} />
			)}

			{phase === Phase.LOCATION
			&& (
				<Button className={styles.button} disabled={stopDetailsContext.data.form.getValues().latitude === 0 || stopDetailsContext.data.form.getValues().longitude === 0 || stopDetailsContext.data.form.getValues().municipality_id === null} label="Avançar" onClick={() => setPhase(Phase.IDENTIFICATION)} />
			)}

			{phase === Phase.IDENTIFICATION
			&& (
				<Button className={styles.button} disabled={stopDetailsContext.data.form.getValues()._id === 'temp' || stopDetailsContext.data.form.getValues().name === 'temp' || stopDetailsContext.data.form.getValues().short_name === 'temp'} label="Avançar" onClick={() => setPhase(Phase.CONFIRMATION)} />
			)}

			{phase === Phase.CONFIRMATION
			&& (
				<Button
					className={styles.button}
					label="Criar Paragem"
					leftSection={<IconMapPlus size={16} />}
					onClick={() => {
						stopDetailsContext.actions.saveStop();
						router.push(Routes.STOP_DETAIL('new'));
					}}
				/>
			)}
		</div>
	);
}
