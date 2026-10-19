'use client';

/* * */

import { AlertCauseIcon } from '@/components/alerts/common/AlertCauseIcon';
import { IconExclamationCircle } from '@tabler/icons-react';
import { GtfsRtCause, GtfsRtCauseValues } from '@tmlmobilidade/go-types-gtfs-rt';
import { Flex, Group, Select, type SelectProps } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type SelectAlertCauseProps = SelectProps;

export function SelectCause({ onChange, value, ...props }: SelectAlertCauseProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const causeOptions = useMemo(
		() => GtfsRtCauseValues.map(cause => ({
			label: cause,
			value: cause,
		})),
		[],
	);

	//
	// B. Render components

	const renderSelectOption: SelectProps['renderOption'] = ({ option }) => {
		return (
			<Group gap={2}>
				<Flex direction="column">
					<AlertCauseIcon cause={option.value as GtfsRtCause} className={styles.icon} withText />
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
					? <AlertCauseIcon cause={value as GtfsRtCause} />
					: <IconExclamationCircle size={20} />
			}
			clearable
		/>
	);
}
