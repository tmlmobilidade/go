'use client';

/* * */

import { IconCloudDown, IconCloudMinus } from '@tabler/icons-react';

import { useExportsContext } from '../../../contexts/exports.context';
import { AppWrapperMenu } from '../AppWrapperMenu';
import { AppWrapperMenuList } from '../AppWrapperMenuList';
import { AppWrapperMenuNoContent } from '../AppWrapperMenuNoContent';
import { ExportsMenuItem } from '../ExportsMenuItem';

/* * */

export function ExportsMenu() {
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
				: <AppWrapperMenuList data={fileExports} itemComponent={({ item }) => <ExportsMenuItem fileExport={item} />} title="Exportações" />}
		</AppWrapperMenu>
	);

	//
}
