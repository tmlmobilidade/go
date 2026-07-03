'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { IconChevronDown, IconChevronUp, IconClockPause, IconCopy, IconGauge, IconPercentage } from '@tabler/icons-react';
import { Button, Collapse, NumberInput, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function ParameterCreateModifiers() {
	//

	//
	// A. Setup variables

	const ctx = useParameterCreateContext();
	const isOverride = ctx.data.form.values.kind === 'override';
	const [open, setOpen] = useState(false);
	const [fixedSpeed, setFixedSpeed] = useState<number>(20);
	const [fixedDwellTime, setFixedDwellTime] = useState<number>(30);
	const [speedFactor, setSpeedFactor] = useState<number>(1);

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<Text size="lg" weight="semibold">Ações rápidas</Text>
					<Text c="var(--color-system-text-200)" size="xs">Aplica valores em lote aos tempos desta configuração.</Text>
				</div>
				<Button
					label={open ? 'Fechar' : 'Abrir'}
					onClick={() => setOpen(v => !v)}
					rightSection={open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
					size="xs"
					variant="secondary"
				/>
			</div>

			<Collapse expanded={open}>
				<div className={styles.actions}>

					{/* Copy from base */}
					{isOverride && (
						<div className={`${styles.actionCard} ${styles.copyCard}`}>
							<div className={styles.actionIcon}>
								<IconCopy size={18} />
							</div>
							<div className={styles.actionContent}>
								<Text size="sm" weight="semibold">Copiar configuração padrão</Text>
								<Text c="var(--color-system-text-200)" size="xs">Substitui velocidades e tempos de paragem pelos valores da configuração padrão.</Text>
							</div>
							<div className={styles.actionControls}>
								<Button
									disabled={!ctx.data.defaultParameter}
									label="Copiar"
									onClick={() => ctx.actions.applyDefaultSpeeds()}
									size="xs"
									variant="secondary"
								/>
							</div>
						</div>
					)}

					{/* Fixed speed */}
					<div className={styles.actionCard}>
						<div className={styles.actionIcon}>
							<IconGauge size={18} />
						</div>
						<div className={styles.actionContent}>
							<Text size="sm" weight="semibold">Velocidade fixa</Text>
							<Text c="var(--color-system-text-200)" size="xs">Define a mesma velocidade média em todos os segmentos.</Text>
						</div>
						<div className={styles.actionControls}>
							<NumberInput
								className={styles.numberInput}
								min={1}
								onChange={v => setFixedSpeed(typeof v === 'number' ? v : 20)}
								placeholder="20"
								size="xs"
								step={1}
								suffix=" km/h"
								value={fixedSpeed}
							/>
							<Button
								label="Aplicar"
								onClick={() => ctx.actions.applyFixedSpeed(fixedSpeed)}
								size="xs"
								variant="secondary"
							/>
						</div>
					</div>

					{/* Fixed dwell time */}
					<div className={styles.actionCard}>
						<div className={styles.actionIcon}>
							<IconClockPause size={18} />
						</div>
						<div className={styles.actionContent}>
							<Text size="sm" weight="semibold">Tempo de paragem fixo</Text>
							<Text c="var(--color-system-text-200)" size="xs">Define o mesmo tempo de paragem em todas as paragens.</Text>
						</div>
						<div className={styles.actionControls}>
							<NumberInput
								className={styles.numberInput}
								max={900}
								min={0}
								onChange={v => setFixedDwellTime(typeof v === 'number' ? v : 30)}
								placeholder="30"
								size="xs"
								step={10}
								suffix=" seg"
								value={fixedDwellTime}
							/>
							<Button
								label="Aplicar"
								onClick={() => ctx.actions.applyFixedDwellTime(fixedDwellTime)}
								size="xs"
								variant="secondary"
							/>
						</div>
					</div>

					{/* Speed factor */}
					<div className={styles.actionCard}>
						<div className={styles.actionIcon}>
							<IconPercentage size={18} />
						</div>
						<div className={styles.actionContent}>
							<Text size="sm" weight="semibold">Ajustar velocidades</Text>
							<Text c="var(--color-system-text-200)" size="xs">Multiplica as velocidades atuais pelo fator indicado.</Text>
						</div>
						<div className={styles.actionControls}>
							<NumberInput
								className={styles.numberInput}
								max={3}
								min={0.1}
								onChange={v => setSpeedFactor(typeof v === 'number' ? v : 1)}
								placeholder="1.0"
								size="xs"
								step={0.1}
								suffix=" x"
								value={speedFactor}
							/>
							<Button
								label="Aplicar"
								onClick={() => ctx.actions.applySpeedFactor(speedFactor)}
								size="xs"
								variant="secondary"
							/>
						</div>
					</div>

				</div>
			</Collapse>
		</div>
	);
}
