'use client';

/* * */

import { useLinesContext } from '@/components/lines/Lines.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { type HubPattern } from '@/types/api/network';
import { formatStopLocation } from '@/utils/format-stop-location';
import { ComboboxItem, ComboboxItemGroup, Flex, Group, Select, SelectProps, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export interface Props extends SelectProps {
	date_filter?: string
	patterns: HubPattern[]
}

interface CustomComboboxItem extends ComboboxItem {
	direction_id: number
	pattern_id: string
}

const PLACEHOLDER_HEADSIGN = 'HeadSign to be defined';

function getPatternTitle(pattern: HubPattern, routeLongName?: string) {
	if (pattern.headsign && pattern.headsign !== PLACEHOLDER_HEADSIGN) {
		return pattern.headsign;
	}

	return pattern.long_name || routeLongName || pattern.headsign;
}

/* * */

export function SelectPattern({ date_filter, onChange, patterns, value, ...props }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	//
	// B. Transform data

	const patternsForSelect = useMemo(() => {
		if (!patterns) return [];

		const withPath = patterns.filter(pattern => pattern.path.length > 0);
		const base = withPath.length > 0 ? withPath : patterns;
		const selected = value ? patterns.find(pattern => pattern.version_id === value) : undefined;

		if (selected && !base.some(pattern => pattern.version_id === value)) {
			return [...base, selected];
		}

		return base;
	}, [patterns, value]);

	const validPatternsSelectOptions = useMemo(() => {
		if (!patternsForSelect.length) return [];

		let data: ComboboxItemGroup<CustomComboboxItem>[] = [];

		// Filter patterns by date
		patternsForSelect.map((patternGroupData) => {
			const group = data.find(group => group.group === patternGroupData.route_id);
			const routeData = linesContext.actions.getRouteDataById(patternGroupData.route_id);

			const item = {
				direction_id: patternGroupData.direction_id,
				disabled: (date_filter ? !patternGroupData.valid_on.includes(date_filter) : false) || !patternGroupData.path.length,
				label: getPatternTitle(patternGroupData, routeData?.long_name),
				pattern_id: patternGroupData.id,
				value: patternGroupData.version_id,
			};

			if (group) {
				group.items.push(item);
			} else {
				data.push({
					group: patternGroupData.route_id,
					items: [item],
				});
			}
		});

		data.forEach(group => group.items.sort((a, b) => a.direction_id - b.direction_id));

		data.sort((a, b) => a.group.localeCompare(b.group));

		data = data.map((group, index) => {
			const routeData = linesContext.actions.getRouteDataById(group.group);
			const letterIndex = String.fromCharCode(65 + index);
			return ({ ...group, group: `${letterIndex} | ${routeData?.long_name}` });
		});

		return data;
	}, [date_filter, linesContext.actions, patternsForSelect]);

	//
	// C. Render components

	const renderSelectOption: SelectProps['renderOption'] = ({ option }: { option: CustomComboboxItem }) => {
		//

		const patternData = patternsForSelect.find(pattern => pattern.version_id === option.value);
		if (!patternData?.path.length) {
			return (
				<Flex align="center" gap={5} justify="center">
					<IconAlertTriangle size={14} />
					<Text size="xs">{t('default:lines.SelectPattern.invalid_option', '', { pattern_id: option.pattern_id })}</Text>
				</Flex>
			);
		};

		const firstStopData = stopsContext.actions.getStopById(patternData.path[0].stop_id);
		const firstStopLocation = formatStopLocation(firstStopData?.locality_name, firstStopData?.municipality_name);

		const routeData = linesContext.actions.getRouteDataById(patternData.route_id);

		return (
			<Group key={option.value} gap={2}>
				<Flex direction="column">
					<Flex align="flex-end" gap={5}>
						<Text fw="bold">{getPatternTitle(patternData, routeData?.long_name)}</Text>
					</Flex>
					<Text size="xs">{t('default:lines.SelectPattern.option_label', '', { locality: firstStopLocation || '' })}</Text>
				</Flex>
			</Group>
		);
	};

	return (
		<Select
			allowDeselect={false}
			data={validPatternsSelectOptions}
			// description={selectDescription}
			label={t('default:lines.SelectPattern.label')}
			onChange={onChange}
			placeholder={t('default:lines.SelectPattern.placeholder')}
			renderOption={renderSelectOption}
			value={value}
			w="100%"
			{...props}
		/>
	);
}
