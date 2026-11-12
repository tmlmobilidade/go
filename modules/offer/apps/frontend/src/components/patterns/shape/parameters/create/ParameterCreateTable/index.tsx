'use client';

/* * */

import { IconClockHour4, IconClockPause, IconPlayerTrackNext, IconSortAscendingNumbers } from '@tabler/icons-react';
import { NumberInput, StandardFormController, Text, TextInput, Tooltip } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../styles.module.css';

import { PathTableColumnStop } from '../../../table/StopsTableColumnStop';
import { useParameterCreateContext } from '../ParameterCreate.context';

/* * */

export function ParameterCreateTable() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const parameterCreateContext = useParameterCreateContext();
	const paths = useMemo(() => parameterCreateContext.data.path ?? [], [parameterCreateContext.data.path]);

	//
	// B. Render components

	return (
		<div className={styles.container}>

			{/* Header */}
			<div className={`${styles.row} ${styles.headerRow}`}>
				<div className={`${styles.column} ${styles.hcenter}`}>
					<Tooltip label={t('default:scheduling.copy.sequence')}>
						<IconSortAscendingNumbers size={20} />
					</Tooltip>
				</div>
				<div className={styles.column}>{t('default:scheduling.copy.stop')}</div>
				<div className={styles.column}>{t('default:scheduling.copy.speed')}</div>
				<div className={styles.column}>{t('default:scheduling.copy.averageTravelTime')}</div>
				<div className={styles.column}>{t('default:scheduling.copy.dwellTime')}</div>

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
							<StandardFormController
								control={parameterCreateContext.form.control}
								name={`path.${index}.avg_speed`}
								render={({ field, fieldState }) => (
									<NumberInput
										aria-label={t('default:scheduling.copy.speedSequence', '', { sequence: index + 1 })}
										disabled={index === 0}
										error={fieldState.error ? t('default:scheduling.copy.validNonnegativeNumber') : undefined}
										leftSection={<IconPlayerTrackNext size={18} />}
										min={0}
										placeholder={t('default:scheduling.copy.speedPlaceholder')}

										step={1}
										suffix=" km/h"
										{...field}
										value={field.value ?? ''}
									/>
								)}
							/>
						</div>

						<div className={styles.column}>
							<Tooltip label={t('default:scheduling.copy.travelTimeHint')} position="bottom" multiline withArrow>
								<TextInput aria-label={t('default:scheduling.copy.averageTravelTimeLabel')} disabled={true} leftSection={<IconClockHour4 size={18} />} placeholder="2 min" value={parameterCreateContext.data.parameterForUI.travelTimes.segmentTravelSeconds.formatted[index]} readOnly />
							</Tooltip>
						</div>

						<div className={styles.column}>
							<StandardFormController
								control={parameterCreateContext.form.control}
								name={`path.${index}.dwell_time`}
								render={({ field, fieldState }) => (
									<NumberInput
										aria-label={t('default:scheduling.copy.dwellSequence', '', { sequence: index + 1 })}
										error={fieldState.error ? t('default:scheduling.copy.validNonnegativeNumber') : undefined}
										leftSection={<IconClockPause size={20} />}
										max={900}
										min={0}
										placeholder={t('default:scheduling.copy.dwellPlaceholder')}
										step={10}
										suffix={t('default:scheduling.copy.secondsSuffix')}
										{...field}
										value={field.value ?? ''}
									/>
								)}
							/>
						</div>

					</div>
				))}
			</div>
		</div>
	);

	//
}
