'use client';

/* * */

import { AlertEffectIcon } from '@/components/alerts/common/AlertEffectIcon';
import { Flex, Group, Select, SelectProps, Text } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';
import { AlertEffect, AlertEffectSchema } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type SelectAlertEffectProps = SelectProps;

export default function Component({ onChange, value, ...props }: SelectAlertEffectProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	//
	// C. Render components
	const renderSelectOption: SelectProps['renderOption'] = ({ option }) => {
		return (
			<Group gap={2}>
				<Flex direction="column">
					{/* Route Long Name */}
					<AlertEffectIcon className={styles.icon} effect={option.value as AlertEffect} withText />
				</Flex>
			</Group>
		);
	};

	const renderSelectRoot = (props) => {
		if (!value) return (
			<div {...props}>
				<Text className={styles.placeholder}>{t('default:alerts.SelectEffect.placeholder')}</Text>
			</div>
		);

		return (
			<div {...props}>
				{/* Route Long Name */}
				<AlertEffectIcon className={styles.icon} effect={value as AlertEffect} withText />
			</div>
		);
	};

	return (
		<Select
			allowDeselect={false}
			data={AlertEffectSchema.options}
			leftSection={<IconBolt size={20} />}
			onChange={onChange}
			renderOption={renderSelectOption}
			value={value}
			w="100%"
			clearable
			{...props}
		/>
	);
}
