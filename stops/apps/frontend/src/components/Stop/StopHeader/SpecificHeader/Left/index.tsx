'use client';

import styles from './styles.module.css';

/* * */

interface LeftProps {
	// long_name?: string
	data: {
		form: {
			getValues: () => { name?: string }
		}
	}
	isManual: boolean
}

/* * */

export function Left({ data, isManual }: LeftProps) {
	//
	// B. Render components

	return (
		<div className={styles.section}>
			{/* Manual -> Save Button */}
			{/* Automatic -> Close Button */}
			{/* {isManual
				? (
					<Tooltip label="Guardar Alterações" position="bottom">
						<div className={styles.iconGreen}>
							<IconDeviceFloppy />
						</div>
					</Tooltip>
				)
				: (
					<Tooltip label="Fechar" position="bottom">
						<div className={styles.icon}>
							<IconX />
						</div>
					</Tooltip>
				)} */}

			{/* Label */}
			<h3>{data.form.getValues().name || <i>Paragem sem Título</i>}</h3>
		</div>
	);
}
