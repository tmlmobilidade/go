/* * */

import { AlertsListFilterCause } from '@/components/scheduled/list/AlertsListFilterCause';
import { AlertsListFilterEffect } from '@/components/scheduled/list/AlertsListFilterEffect';
import { AlertsListFilterMunicipality } from '@/components/scheduled/list/AlertsListFilterMunicipality';
import { AlertsListFilterPublishStatus } from '@/components/scheduled/list/AlertsListFilterPublishStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFiltersBar() {
	return (
		<FiltersBar>
			<AlertsListFilterPublishStatus />
			<AlertsListFilterCause />
			<AlertsListFilterEffect />
			<AlertsListFilterMunicipality />
			{/* <LineFilter /> */}
			{/* <StopFilter /> */}
			{/* <PublishDateFilter /> */}
			{/* <ValidityDateFilter /> */}
		</FiltersBar>
	);
}

/* * */

// function MunicipalityFilter() {
// 	const { actions, filters } = useAlertListContext();
// 	const { data: { municipalities } } = useLocationsContext();

// 	const parseMunicipality = (id: string) => {
// 		const municipality = municipalities.find(m => m.id === id);
// 		return municipality ? municipality.name : '';
// 	};

// 	const hasChanged = filters.municipality.length !== filters.municipalityOptions.length;

// 	return (
// 		<Menu trigger="click-hover" withArrow>
// 			<Menu.Target>
// 				<Badge variant={hasChanged ? 'primary' : 'muted'}>Municípios</Badge>
// 			</Menu.Target>
// 			<Menu.Dropdown classNames={{ dropdown: styles.dropdown }}>
// 				<Menu.Item closeMenuOnClick={false} p="sm">
// 					<div
// 						className={styles.filterItem}
// 						onClick={actions.toggleAllMunicipality}
// 					>
// 						<Checkbox
// 							checked={filters.municipality.length === filters.municipalityOptions.length}
// 							indeterminate={
// 								filters.municipality.length > 0
// 								&& filters.municipality.length < filters.municipalityOptions.length
// 							}
// 						/>
// 						<Text className={styles.filterTitle} size="sm" weight="medium">Selecionar tudo</Text>
// 					</div>
// 				</Menu.Item>
// 				{filters.municipalityOptions.map(municipality => (
// 					<div key={municipality} onClick={() => actions.toggleMunicipality(municipality)}>
// 						<Menu.Item closeMenuOnClick={false} p="sm">
// 							<div className={styles.filterItem}>
// 								<Checkbox checked={filters.municipality.includes(municipality)} onChange={e => e.stopPropagation()} />
// 								<Text className={styles.filterTitle} size="sm" weight="medium">{parseMunicipality(municipality)}</Text>
// 							</div>
// 						</Menu.Item>
// 					</div>
// 				))}
// 			</Menu.Dropdown>
// 		</Menu>
// 	);
// }

/* * */

// function LineFilter() {
// 	const { actions, filters } = useAlertListContext();
// 	const { data: { lines } } = useLinesContext();

// 	const parseLine = (line_id: string) => {
// 		const line = lines.find(l => l.id === line_id);
// 		return `[${line?.id}] - ${line?.long_name ?? ''}`;
// 	};

// 	const hasChanged = filters.line.length !== filters.lineOptions.length;

// 	return (
// 		<Menu trigger="click-hover" withArrow>
// 			<Menu.Target>
// 				<Badge variant={hasChanged ? 'primary' : 'muted'}>Linhas</Badge>
// 			</Menu.Target>
// 			<Menu.Dropdown classNames={{ dropdown: styles.lineDropdown }}>
// 				<ViewportList items={filters.lineOptions}>
// 					{route_id => (
// 						<div key={route_id} onClick={() => actions.toggleLine(route_id)}>
// 							<Menu.Item closeMenuOnClick={false} p="sm">
// 								<div className={styles.filterItem}>
// 									<Checkbox checked={filters.line.includes(route_id)} onChange={e => e.stopPropagation()} />
// 									<Text className={styles.filterTitle} size="sm" weight="medium">{parseLine(route_id)}</Text>
// 								</div>
// 							</Menu.Item>
// 						</div>
// 					)}
// 				</ViewportList>
// 			</Menu.Dropdown>
// 		</Menu>
// 	);
// }

/* * */

// function StopFilter() {
// 	const { actions, filters } = useAlertListContext();
// 	const { data: { stops } } = useStopsContext();

// 	const parseStop = (stop_id: string) => {
// 		const stop = stops.find(s => s.id === stop_id);
// 		return `[${stop?.id}] - ${stop?.long_name ?? ''}`;
// 	};

// 	const hasChanged = filters.stop.length !== filters.stopOptions.length;

// 	return (
// 		<Menu trigger="click-hover" withArrow>
// 			<Menu.Target>
// 				<Badge variant={hasChanged ? 'primary' : 'muted'}>Paragens</Badge>
// 			</Menu.Target>
// 			<Menu.Dropdown classNames={{ dropdown: styles.stopDropdown }}>
// 				<ViewportList items={filters.stopOptions}>
// 					{stop_id => (
// 						<div key={stop_id} onClick={() => actions.toggleStop(stop_id)}>
// 							<Menu.Item closeMenuOnClick={false} p="sm">
// 								<div className={styles.filterItem}>
// 									<Checkbox checked={filters.stop.includes(stop_id)} onChange={e => e.stopPropagation()} />
// 									<Text className={styles.filterTitle} size="sm" weight="medium">{parseStop(stop_id)}</Text>
// 								</div>
// 							</Menu.Item>
// 						</div>
// 					)}
// 				</ViewportList>
// 			</Menu.Dropdown>
// 		</Menu>
// 	);
// }

/* * */

// function PublishDateFilter() {
// 	const { actions, filters } = useAlertListContext();

// 	const hasChanged = filters.publishDateStart || filters.publishDateEnd;

// 	return (
// 		<Menu closeOnClickOutside={false} trigger="click-hover" withArrow>
// 			<Menu.Target>
// 				<Badge variant={hasChanged ? 'primary' : 'muted'}>Visibilidade</Badge>
// 			</Menu.Target>
// 			<Menu.Dropdown classNames={{ dropdown: styles.dropdown }}>
// 				<Text className={styles.filterDescription} size="sm" weight="medium">Datas em que o alerta é visível nos canais digitais, não necessariamente a data de que é valido (Periodo de vigência)</Text>
// 				<div className={styles.filterItem}>
// 					<DateTimePicker description="Data de início da visibilidade do alerta" flex={1} label="Data de início" onChange={actions.changePublishDateStart} value={filters.publishDateStart} clearable />
// 					<DateTimePicker description="Data de fim da visibilidade do alerta" flex={1} label="Data de fim" onChange={actions.changePublishDateEnd} value={filters.publishDateEnd} clearable />
// 				</div>
// 			</Menu.Dropdown>
// 		</Menu>
// 	);
// }

/* * */

// function ValidityDateFilter() {
// 	const { actions, filters } = useAlertListContext();

// 	const hasChanged = filters.validityDateStart || filters.validityDateEnd;

// 	return (
// 		<Menu closeOnClickOutside={false} trigger="click-hover" withArrow>
// 			<Menu.Target>
// 				<Badge variant={hasChanged ? 'primary' : 'muted'}>Vigência</Badge>
// 			</Menu.Target>
// 			<Menu.Dropdown classNames={{ dropdown: styles.dropdown }}>
// 				<Text className={styles.filterDescription} size="sm" weight="medium">Datas em que o alerta é válido</Text>
// 				<div className={styles.filterItem}>
// 					<DateTimePicker description="Data de início da validade do alerta" flex={1} label="Data de início" onChange={actions.changeValidityDateStart} value={filters.validityDateStart} clearable />
// 					<DateTimePicker description="Data de fim da validade do alerta" flex={1} label="Data de fim" onChange={actions.changeValidityDateEnd} value={filters.validityDateEnd} clearable />
// 				</div>
// 			</Menu.Dropdown>
// 		</Menu>
// 	);
// }
