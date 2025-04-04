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
	label: string
	placeholder?: string
	value: boolean | string
}

/* * */

export default function Item({ children, color, description, label, placeholder, value }: ItemProps) {
	//

	//
	// A. Render components

	return (
		<div className={
			typeof value === 'boolean'
				? styles.input_checkbox_container
				: children ? styles.input_text_container_with_icon
					: styles.input_text_container
		}
		>
			{/* Text Input with Icon */}
			{
				typeof value === 'string' && children
				&& (
					<>
						<TextInput
							className={color === 'purple' ? styles.input_text_purple_with_icon : styles.input_text_with_icon}
							description={description}
							label={label}
							maxLength={255}
							placeholder={placeholder}
							value={value}
							disabled
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
				typeof value === 'string' && !children

				&& (
					<TextInput
						className={color === 'green' ? styles.input_text_green : styles.input_text}
						description={description}
						label={label}
						maxLength={255}
						placeholder={placeholder}
						value={value}
						disabled
						// {...alertDetailData.form.getInputProps('title')}
					/>
				)

			}
			{/* Checkbox */}
			{
				typeof value === 'boolean'
				&& <Checkbox checked={value} className={styles.input_checkbox} label={label} disabled />
			}
		</div>
	);
}
