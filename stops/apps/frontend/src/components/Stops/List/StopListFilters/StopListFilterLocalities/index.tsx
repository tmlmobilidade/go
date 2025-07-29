/* * */

import { Badge, Grid, Menu } from '@tmlmobilidade/ui';

import { StopListFilterDistrict } from './StopListFilterDistrict';
import { StopListFilterMunicipality } from './StopListFilterMuncipality';
// import { StopListFilterMunicipality } from './StopListFilterMuncipality';
// import { StopListFilterParish } from './StopListFilterParishes';

/* * */

export function StopListFilterLocations() {
	return (
		<>
			<StopListFilterDistrict />
			<StopListFilterMunicipality />
		</>
		// <Menu trigger="click-hover" withArrow>
		// 	<Menu.Target>
		// 		<Badge>Paragens</Badge>
		// 	</Menu.Target>
		// 	<Menu.Dropdown>
		// 		<Menu.Item p="sm">
		// 			<div>
		// 				<Grid columns="a" gap="sm">
		// 					<StopListFilterDistrict />
		// 				</Grid>
		// 			</div>
		// 		</Menu.Item>
		// 	</Menu.Dropdown>
		// </Menu>

	);
}
