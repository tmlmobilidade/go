/* * */

import { Alert } from '@tmlmobilidade/types';

export type TemplateParam = '{headsign_prose}'
  | '{headsign_title}'
  | '{holiday_name}'
  | '{line_short_name[]}'
  | '{line_short_name}'
  | '{lines_prose}'
  | '{lines_title}'
  | '{start_time[]}'
  | '{start_time}'
  | '{stops_prose}'
  | '{stops_title}';

export interface StringType {
	params: TemplateParam[]
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
