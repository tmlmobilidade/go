'use client';

import { DataTable, DataTableColumn, Pane, Section } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface ParsedMdxFile {
	_id: string
	html: string
	subtitle?: string
	tags: string[]
	title: string
}

export function WikiTable() {
	//

	//
	// A. Setup variables
	const [files, setFiles] = useState([]);

	useEffect(() => {
		fetch('http://localhost:52020/wiki/')
			.then(res => res.json())
			.then((data) => {
				setFiles(data);
			})
			.catch((err) => {
				console.error('fetch files error', err);
			});
	}, []);

	const columns: DataTableColumn<ParsedMdxFile>[] = [
		{
			accessor: '_id',
			title: 'ID',
			width: 150,
		},
		{
			accessor: 'title',
			title: 'Título',
			width: 150,
		},
		{
			accessor: 'tags',
			title: 'Categorias',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (files) => {
		window.open('https://carrismetropolitana.pt/');
	};

	//
	// C. Render components

	return (
		<Pane>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={files}
			/>
		</Pane>
	);
}
