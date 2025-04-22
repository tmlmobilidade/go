'use client';

/* * */

import { Checkbox, TextInput } from '@tmlmobilidade/ui';
import { ReactNode } from 'react';

/* * */

import styles from './styles.module.css';

/* * */

interface ItemProps {
	children?: ReactNode
	color?: 'green' | 'purple'
	description?: string
	inputProps: object
	isBoolean?: boolean
	label: string
	placeholder?: string
}

/* * */

export default function Item({ children, color, description, inputProps, isBoolean, label, placeholder }: ItemProps) {
	//

	//
	// A. Render components

	return (
		<div className={
			isBoolean
				? styles.input_checkbox_container
				: children ? styles.input_text_container_with_icon
					: styles.input_text_container
		}
		>
			{/* Text Input with Icon */}
			{
				!isBoolean && children
				&& (
					<>
						<TextInput
							className={color === 'purple' ? styles.input_text_purple_with_icon : styles.input_text_with_icon}
							description={description}
							label={label}
							maxLength={255}
							placeholder={placeholder}
							// value={value}
							// disabled
							{...inputProps}
							// {...alertDetailData.form.getInputProps('title')}
						/>
						<div className={
							color === 'green'
								? styles.icon_green
								: color === 'purple'
									? styles.icon_purple
									: styles.icon_blue
						}
						>
							{children}
						</div>
					</>
				)
			}
			{/* Text Input */}
			{
				!isBoolean && !children

				&& (
					<TextInput
						className={color === 'green' ? styles.input_text_green : styles.input_text}
						description={description}
						label={label}
						maxLength={255}
						placeholder={placeholder}
						// value={value}
						// disabled
						{...inputProps}
						// {...alertDetailData.form.getInputProps('title')}
					/>
				)

			}
			{/* Checkbox */}
			{/* {
				isBoolean
				&& <Checkbox checked={value} className={styles.input_checkbox} label={label} disabled />
			} */}
		</div>
	);
}
