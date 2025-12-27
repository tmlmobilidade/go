/* * */

import { type Alert, type RideNormalized, type Stop } from '@tmlmobilidade/types';

export type TemplatePlaceholder = '{headsign_prose}'
  | '{headsign_title}'
  | '{holiday_name}'
  | '{line_short_name[]}'
  | '{line_short_name}'
  | '{lines_prose}'
  | '{lines_title}'
  | '{rides_description}'
  | '{rides_title}'
  | '{start_time[]}'
  | '{start_time}'
  | '{stops_prose}'
  | '{stops_title}';

export interface StringType {
	placeholders: TemplatePlaceholder[]
	text: string
}

export type I18nCodes = 'en' | 'pt';

export interface CountableStringType {
	plural?: Record<I18nCodes, StringType>
	singular: Record<I18nCodes, StringType>
}

export interface TemplateFragment {
	description: CountableStringType
	title: CountableStringType
}

export type AlertConfigKey = `${Alert['cause']}:${Alert['effect']}:${Alert['reference_type']}`;

export type AlertTemplateRegistry = Record<AlertConfigKey, TemplateFragment>;

/* * */

export interface DescribeAlertProps {
	alert_type: Alert['type']
	cause: Alert['cause']
	data: {
		lines?: { id: string }[]
		rides?: RideNormalized[]
		stops?: Stop[]
	}
	effect: Alert['effect']
	reference_type: Alert['reference_type']
	references: Alert['references']
}
