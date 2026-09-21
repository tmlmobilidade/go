/** A fixed-width segment in a formatted logger message. */
export interface LoggerColumn {
	/** Column alignment. */
	a?: 'left' | 'right'

	/** Column width. */
	c?: number

	/** Column value. */
	t: number | string
}

/** Message values accepted by the logger. */
export type LoggerMessage = (LoggerColumn | string)[] | Error | string;

/** Structured attributes accepted by informational logs. */
export type LoggerInfoContext = Record<string, unknown> & {
	message?: string
};

/** Structured attributes and console controls accepted by error logs. */
export type LoggerErrorContext = LoggerInfoContext & {
	silentConsole?: boolean
};

/** Arguments accepted by informational logs. */
export interface InfoArgs {
	contextOrSpacesAfter?: LoggerInfoContext | number | string
	message?: LoggerMessage
	spacesAfterOrBefore?: number
	spacesBefore?: number
}

/** Arguments accepted by error and fatal logs. */
export interface ErrorArgs {
	contextOrErrorOrSpacesAfter?: Error | LoggerErrorContext | number | string
	error?: Error
	message?: LoggerMessage
	spacesAfterOrBefore?: number
	spacesBefore?: number
}

/** Arguments accepted by progress logs. */
export interface ProgressArgs {
	message: LoggerMessage
	spacesAfterOrBefore?: number
	spacesBefore?: number
}
