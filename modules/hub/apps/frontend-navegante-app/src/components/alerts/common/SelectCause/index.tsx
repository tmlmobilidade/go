'use client';

/* * */

import { AlertCauseIcon } from '@/components/alerts/common/AlertCauseIcon';
import { Flex, Group, Select, type SelectProps } from '@mantine/core';
import { IconExclamationCircle } from '@tabler/icons-react';
import { AlertCause, AlertCauseSchema } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type SelectAlertCauseProps = SelectProps;

export default function Component({ onChange, value, ...props }: SelectAlertCauseProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const causeOptions = useMemo(
		() => AlertCauseSchema.options.map(cause => ({
			label: t(`shared:alerts.causes.${cause}.title`),
			value: cause,
		})),
		[t],
	);

	//
	// B. Render components

	const renderSelectOption: SelectProps['renderOption'] = ({ option }) => {
		return (
			<Group gap={2}>
				<Flex direction="column">
					<AlertCauseIcon cause={option.value as AlertCause} className={styles.icon} withText />
				</Flex>
			</Group>
		);
	};

	return (
		<Select
			data={causeOptions}
			onChange={onChange}
			placeholder={t('default:alerts.SelectCause.placeholder')}
			renderOption={renderSelectOption}
			value={value}
			w="100%"
			{...props}
			leftSection={
				value
					? <AlertCauseIcon cause={value as AlertCause} />
					: <IconExclamationCircle size={20} />
			}
			clearable
		/>
	);
}
