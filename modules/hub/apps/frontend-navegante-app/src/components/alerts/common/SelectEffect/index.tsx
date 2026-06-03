'use client';

/* * */

import { AlertEffectIcon } from '@/components/alerts/common/AlertEffectIcon';
import { Flex, Group, Select, type SelectProps } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';
import { AlertEffect, AlertEffectSchema } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type SelectAlertEffectProps = SelectProps;

export default function Component({ onChange, value, ...props }: SelectAlertEffectProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const effectOptions = useMemo(
		() => AlertEffectSchema.options.map(effect => ({
			label: t(`shared:alerts.effects.${effect}.title`),
			value: effect,
		})),
		[t],
	);

	//
	// B. Render components

	const renderSelectOption: SelectProps['renderOption'] = ({ option }) => {
		return (
			<Group gap={2}>
				<Flex direction="column">
					<AlertEffectIcon className={styles.icon} effect={option.value as AlertEffect} withText />
				</Flex>
			</Group>
		);
	};

	return (
		<Select
			data={effectOptions}
			onChange={onChange}
			placeholder={t('default:alerts.SelectEffect.placeholder')}
			renderOption={renderSelectOption}
			value={value}
			w="100%"
			{...props}
			leftSection={
				value ? <AlertEffectIcon effect={value as AlertEffect} /> : <IconBolt size={20} />
			}
			clearable
		/>
	);
}
