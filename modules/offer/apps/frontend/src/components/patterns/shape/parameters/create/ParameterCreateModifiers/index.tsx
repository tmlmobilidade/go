'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { IconChevronDown, IconChevronUp, IconCopy, IconPercentage } from '@tabler/icons-react';
import { Button, Collapse, NumberInput, Section, Text } from '@tmlmobilidade/ui';
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
	const [speedFactor, setSpeedFactor] = useState<number>(1);

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Button
				label="Ações rápidas"
				onClick={() => setOpen(v => !v)}
				rightSection={open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
				variant="secondary"
				w="fit-content"
			/>

			<Collapse expanded={open}>
				<Section flexDirection="column" gap="sm" padding="none">

					{/* Copy from base */}
					{isOverride && (
						<Button
							disabled={!ctx.data.defaultParameter}
							label="Copiar da configuração padrão"
							leftSection={<IconCopy size={16} />}
							onClick={() => ctx.actions.applyDefaultSpeeds()}
							variant="secondary"
							w="fit-content"
						/>
					)}

					{/* Fixed speed */}
					<Section flexDirection="column" gap="xs" padding="none">
						<Text size="sm" weight="semibold">Aplicar velocidade fixa</Text>
						<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
							<NumberInput
								min={1}
								onChange={v => setFixedSpeed(typeof v === 'number' ? v : 20)}
								placeholder="20"
								size="xs"
								step={1}
								styles={{ wrapper: { width: 100 } }}
								suffix=" km/h"
								value={fixedSpeed}
							/>
							<Button
								label="Aplicar a todos"
								onClick={() => ctx.actions.applyFixedSpeed(fixedSpeed)}
								variant="secondary"
							/>
						</Section>
					</Section>

					{/* Speed factor */}
					<Section flexDirection="column" gap="xs" padding="none">
						<Text size="sm" weight="semibold">Ajustar velocidades existentes</Text>
						<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
							<NumberInput
								max={3}
								min={0.1}
								onChange={v => setSpeedFactor(typeof v === 'number' ? v : 1)}
								placeholder="1.0"
								size="xs"
								step={0.1}
								styles={{ wrapper: { width: 90 } }}
								suffix=" x"
								value={speedFactor}
							/>
							<Button
								label="Aplicar ajuste"
								leftSection={<IconPercentage size={16} />}
								onClick={() => ctx.actions.applySpeedFactor(speedFactor)}
								variant="secondary"
							/>
						</Section>
					</Section>

				</Section>
			</Collapse>
		</div>
	);
}
