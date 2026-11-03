'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { IconChevronDown, IconChevronUp, IconClockPause, IconCopy, IconGauge, IconPercentage } from '@tabler/icons-react';
import { Button, Collapse, NumberInput, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ParameterCreateModifiers() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const ctx = useParameterCreateContext();
	const isOverride = ctx.data.values.kind === 'override';
	const [open, setOpen] = useState(false);
	const [fixedSpeed, setFixedSpeed] = useState<number>(20);
	const [fixedDwellTime, setFixedDwellTime] = useState<number>(30);
	const [speedFactor, setSpeedFactor] = useState<number>(1);

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<Text size="lg" weight="semibold">{t('default:scheduling.copy.quickActions')}</Text>
					<Text c="var(--color-system-text-200)" size="xs">{t('default:scheduling.copy.batchHint')}</Text>
				</div>
				<Button
					label={open ? t('default:scheduling.copy.close') : t('default:scheduling.copy.open')}
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
								<Text size="sm" weight="semibold">{t('default:scheduling.copy.copyDefault')}</Text>
								<Text c="var(--color-system-text-200)" size="xs">{t('default:scheduling.copy.copyDefaultHint')}</Text>
							</div>
							<div className={styles.actionControls}>
								<Button
									disabled={!ctx.data.defaultParameter}
									label={t('default:scheduling.copy.copy')}
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
							<Text size="sm" weight="semibold">{t('default:scheduling.copy.fixedSpeed')}</Text>
							<Text c="var(--color-system-text-200)" size="xs">{t('default:scheduling.copy.fixedSpeedHint')}</Text>
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
								label={t('default:scheduling.copy.apply')}
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
							<Text size="sm" weight="semibold">{t('default:scheduling.copy.fixedDwell')}</Text>
							<Text c="var(--color-system-text-200)" size="xs">{t('default:scheduling.copy.fixedDwellHint')}</Text>
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
								label={t('default:scheduling.copy.apply')}
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
							<Text size="sm" weight="semibold">{t('default:scheduling.copy.adjustSpeeds')}</Text>
							<Text c="var(--color-system-text-200)" size="xs">{t('default:scheduling.copy.adjustSpeedsHint')}</Text>
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
								label={t('default:scheduling.copy.apply')}
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
