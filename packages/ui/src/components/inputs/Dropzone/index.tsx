'use client';

import { DropzoneAccept, DropzoneIdle, DropzoneReject, Dropzone as MantineDropzone, DropzoneProps as MantineDropzoneProps } from '@mantine/dropzone';

/* * */

export function Dropzone({ ...props }: MantineDropzoneProps) {
	//

	//
	// A. Render components

	return (
		<MantineDropzone
			{...props}
		/>
	);

	//
}

Dropzone.Accept = DropzoneAccept;
Dropzone.Reject = DropzoneReject;
Dropzone.Idle = DropzoneIdle;
