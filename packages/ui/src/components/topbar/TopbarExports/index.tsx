'use client';

/* * */

import { IconCloudDown, IconCloudMinus } from '@tabler/icons-react';

import { useExportsContext } from '../../../contexts/exports.context';
import { TopbarExportsItem } from '../TopbarExportsItem';
import { TopbarMenu } from '../TopbarMenu';
import { TopbarMenuList } from '../TopbarMenuList';
import { TopbarMenuNoContent } from '../TopbarMenuNoContent';

/* * */

export function TopbarExports() {
	//

	//
	// A. Setup variables

	const exportsContext = useExportsContext();
	const fileExports = exportsContext.data.fileExports || [];

	//
	// B. Render components

	return (
		<TopbarMenu counter={fileExports.length} icon={IconCloudDown} label="Exportações">
			{fileExports.length === 0
				? <TopbarMenuNoContent icon={IconCloudMinus} text="Sem exportações disponíveis" />
				: <TopbarMenuList data={fileExports} itemComponent={({ item }) => <TopbarExportsItem fileExport={item} />} title="Exportações" />}
		</TopbarMenu>
	);

	//
}
