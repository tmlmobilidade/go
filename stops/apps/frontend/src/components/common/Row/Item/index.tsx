'use client';

/* * */

import { Checkbox, Combobox, DataItem, DateTimePicker, TextInput } from '@tmlmobilidade/ui';
import { ReactNode } from 'react';

/* * */

import styles from './styles.module.css';

/* * */

interface ItemProps {
	children?: ReactNode
	color?: 'green' | 'purple'
	comboBoxValues?: DataItem[] | string[]
	date?: Date
	dateSetter?: (date: Date) => void
	description?: string
	inputProps: object
	isBoolean?: boolean
	isComboBox?: boolean
	isDatePicker?: boolean
	label: string
	placeholder?: string
}

/* * */

export default function Item({ children, color, comboBoxValues, date, dateSetter, description, inputProps, isBoolean, isComboBox, isDatePicker, label, placeholder }: ItemProps) {
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
				!isBoolean && !isComboBox && !isDatePicker && children
				&& (
					<>
						<TextInput
							className={color === 'purple' ? styles.input_text_purple_with_icon : styles.input_text_with_icon}
							description={description}
							label={label}
							maxLength={255}
							placeholder={placeholder}
							{...inputProps}
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
				!isBoolean && !isComboBox && !isDatePicker && !children

				&& (
					<TextInput
						className={color === 'green' ? styles.input_text_green : styles.input_text}
						description={description}
						label={label}
						maxLength={255}
						placeholder={placeholder}
						{...inputProps}
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
			{/* Date Picker */}
			{
				isDatePicker && !!date && !!dateSetter
				&& (
					<DateTimePicker
						description={description}
						label={label}
						{...inputProps}
						value={date}
						onChange={(date) => {
							dateSetter(date);
						}}
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
