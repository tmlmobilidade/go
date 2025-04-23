'use client';

/* * */

import { Checkbox, Combobox, DataItem, TextInput } from '@tmlmobilidade/ui';
import { ReactNode } from 'react';

/* * */

import styles from './styles.module.css';

/* * */

interface ItemProps {
	children?: ReactNode
	color?: 'green' | 'purple'
	comboBoxValues?: DataItem[] | string[]
	description?: string
	inputProps: object
	isBoolean?: boolean
	isComboBox?: boolean
	label: string
	placeholder?: string
}

/* * */

export default function Item({ children, color, comboBoxValues, description, inputProps, isBoolean, isComboBox, label, placeholder }: ItemProps) {
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
				!isBoolean && !isComboBox && children
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
				!isBoolean && !isComboBox && !children

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
			{/* ComboBox */}
			{
				isComboBox && !!comboBoxValues
				&& (
					<Combobox
						data={comboBoxValues}
						description={description}
						label={label}
						{...inputProps}
					/>
				)
			}

			{/* Children */}
			{/* Checkbox */}
			{/* {
				isBoolean
				&& <Checkbox checked={value} className={styles.input_checkbox} label={label} disabled />
			} */}
		</div>
	);
}
