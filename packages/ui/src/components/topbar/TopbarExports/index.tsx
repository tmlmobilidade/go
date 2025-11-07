'use client';

/* * */

import { IconCloudDown, IconCloudMinus } from '@tabler/icons-react';

import { useExportsContext } from '../../../contexts/exports.context';
import { AppWrapperMenu } from '../AppWrapperMenu';
import { AppWrapperMenuList } from '../AppWrapperMenuList';
import { AppWrapperMenuNoContent } from '../AppWrapperMenuNoContent';
import { TopbarExportsItem } from '../TopbarExportsItem';

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
		<AppWrapperMenu counter={fileExports.length} icon={IconCloudDown}>
			{fileExports.length === 0
				? <AppWrapperMenuNoContent icon={IconCloudMinus} text="Sem exportações disponíveis" />
				: <AppWrapperMenuList data={fileExports} itemComponent={({ item }) => <TopbarExportsItem fileExport={item} />} title="Exportações" />}
		</AppWrapperMenu>
	);

	//
}
