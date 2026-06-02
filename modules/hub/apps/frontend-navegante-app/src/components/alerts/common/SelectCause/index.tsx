// 'use client';

// /* * */

// import { AlertCauseIcon } from '@/components/alerts/common/AlertCauseIcon';
// // import { useDebugContext } from '@/contexts/Debug.context';
// import { Flex, Group, Select, SelectProps, Text } from '@mantine/core';
// import { IconExclamationCircle } from '@tabler/icons-react';
// import { AlertCause } from '@tmlmobilidade/types';
// import { useTranslation } from 'react-i18next';

// import styles from './styles.module.css';

// /* * */

// type SelectAlertCauseProps = SelectProps;

// export default function Component({ onChange, value, ...props }: SelectAlertCauseProps) {
// 	//
// 	// A. Setup variables
// 	const { t } = useTranslation();
// 	// const debugContext = useDebugContext();

// 	//
// 	// B. Transform data

// 	//
// 	// C. Render components
// 	const renderSelectOption: SelectProps['renderOption'] = ({ option }) => {
// 		return (
// 			<Group gap={2}>
// 				<Flex direction="column">
// 					{/* Route Long Name */}
// 					<AlertCauseIcon cause={option.value as AlertCause} className={styles.icon} withText />
// 				</Flex>
// 			</Group>
// 		);
// 	};

// 	const renderSelectRoot = (props) => {
// 		if (!value) return (
// 			<div {...props}>
// 				<Text className={styles.placeholder}>{t('default:alerts.SelectCause.placeholder')}</Text>
// 			</div>
// 		);

// 		return (
// 			<div {...props}>
// 				{/* Route Long Name */}
// 				<AlertCauseIcon cause={AlertCause[value]} className={styles.icon} withText />
// 			</div>
// 		);
// 	};

// 	return (
// 		<Select
// 			allowDeselect={false}
// 			data={Object.values(AlertCause)}
// 			leftSection={<IconExclamationCircle size={20} />}
// 			onChange={onChange}
// 			renderOption={renderSelectOption}
// 			renderRoot={renderSelectRoot || undefined}
// 			value={value}
// 			w="100%"
// 			clearable
// 			{...props}
// 		/>
// 	);
// }
