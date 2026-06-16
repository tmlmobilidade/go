/* * */

import { IconClockHour4, IconClockPause, IconPlayerTrackNext, IconSortAscendingNumbers } from '@tabler/icons-react';
import { NumberInput, Text, TextInput, Tooltip } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from '../styles.module.css';

import { PathTableColumnStop } from '../../../table/StopsTableColumnStop';
import { useParameterCreateContext } from '../ParameterCreate.context';

/* * */

export function ParameterCreateTable() {
	//

	//
	// A. Setup variables

	const parameterCreateContext = useParameterCreateContext();
	const paths = useMemo(() => parameterCreateContext.data.path ?? [], [parameterCreateContext.data.path]);

	//
	// B. Render components

	return (
		<div className={styles.container}>

			{/* Header */}
			<div className={`${styles.row} ${styles.headerRow}`}>
				<div className={`${styles.column} ${styles.hcenter}`}>
					<Tooltip label="Sequência">
						<IconSortAscendingNumbers size={20} />
					</Tooltip>
				</div>
				<div className={styles.column}>
					Paragem
				</div>
				<div className={styles.column}>
					Velocidade média
				</div>
				<div className={styles.column}>
					Tempo médio de viagem
				</div>
				<div className={styles.column}>
					Tempo de paragem
				</div>

			</div>

			{/* Body */}
			<div className={styles.body}>
				{paths.map((pathItem, index) => (
					<div key={index} className={`${styles.row} ${styles.bodyRow}`}>
						<div className={`${styles.column} ${styles.hcenter}`}>
							<Text>{index + 1}</Text>
						</div>

						<PathTableColumnStop pathItem={pathItem} />

						<div className={styles.column}>
							<NumberInput
								aria-label={`Velocidade média para a sequência ${index + 1}`}
								defaultValue={20}
								leftSection={<IconPlayerTrackNext size={18} />}
								min={0}
								placeholder="Velocidade média (km/h)"
								step={1}
								suffix=" km/h"
								{...parameterCreateContext.data.form.getInputProps(`path.${index}.avg_speed`)}
								disabled={index === 0}
							/>
						</div>

						<div className={styles.column}>
							<Tooltip label="Tempo médio de viagem calculado com base na distância e na velocidade média no segmento entre esta paragem e a anterior." position="bottom" multiline withArrow>
								<TextInput aria-label="Tempo Médio de Viagem" disabled={true} leftSection={<IconClockHour4 size={18} />} placeholder="2 min" value={parameterCreateContext.data.parameterForUI.travelTimes.segmentTravelSeconds.formatted[index]} readOnly />
							</Tooltip>
						</div>

						<div className={styles.column}>
							<NumberInput
								aria-label={`Tempo de paragem para a sequência ${index + 1}`}
								defaultValue={30}
								leftSection={<IconClockPause size={20} />}
								max={900}
								min={0}
								placeholder="Tempo de paragem (segundos)"
								step={10}
								suffix=" seg"
								{...parameterCreateContext.data.form.getInputProps(`path.${index}.dwell_time`)}
							/>
						</div>

					</div>
				))}
			</div>
		</div>
	);

	//
}
