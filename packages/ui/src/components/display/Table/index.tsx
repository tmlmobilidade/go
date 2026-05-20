'use client';

import { Table as MantineTable, type TableProps as MantineTableProps, type TableTbodyProps as MantineTableTbodyProps, type TableTdProps as MantineTableTdProps, type TableTheadProps as MantineTableTheadProps, type TableThProps as MantineTableThProps, type TableTrProps as MantineTableTrProps } from '@mantine/core';

/* * */

export type TableProps = MantineTableProps;
export type TableTheadProps = MantineTableTheadProps;
export type TableTbodyProps = MantineTableTbodyProps;
export type TableTrProps = MantineTableTrProps;
export type TableTdProps = MantineTableTdProps;
export type TableThProps = MantineTableThProps;

/* * */

export function Table(props: TableProps) {
	return <MantineTable {...props} />;
}

Table.Thead = function TableThead(props: TableTheadProps) {
	return <MantineTable.Thead {...props} />;
};

Table.Tbody = function TableTbody(props: TableTbodyProps) {
	return <MantineTable.Tbody {...props} />;
};

Table.Tr = function TableTr(props: TableTrProps) {
	return <MantineTable.Tr {...props} />;
};

Table.Td = function TableTd(props: TableTdProps) {
	return <MantineTable.Td {...props} />;
};

Table.Th = function TableTh(props: TableThProps) {
	return <MantineTable.Th {...props} />;
};
