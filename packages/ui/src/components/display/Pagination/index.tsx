'use client';

import { Pagination as MantinePagination, type PaginationProps as MantinePaginationProps } from '@mantine/core';

import styles from './styles.module.css';

/* * */

export type PaginationProps = MantinePaginationProps;

/* * */

export function Pagination(props: PaginationProps) {
	return (
		<MantinePagination
			classNames={{
				control: styles.control,
				dots: styles.dots,
				root: styles.root,
			}}
			{...props}
		/>
	);
}
