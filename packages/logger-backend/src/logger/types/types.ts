export interface LoggerColumn {
	a?: 'left' | 'right'
	c?: number
	t: number | string
}

export type LoggerMessage = (LoggerColumn | string)[] | string;
