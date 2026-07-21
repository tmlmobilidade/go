export interface LoggerColumn {
	a?: 'left' | 'right'
	c?: number
	t: number | string
}

export type LoggerMessage = (LoggerColumn | string)[] | string;

export type LoggerErrorInputContext = Record<string, unknown> & {
	message?: string
	silentConsole?: boolean
};

export type LoggerInfoInputContext = Record<string, unknown> & {
	message?: string
};
