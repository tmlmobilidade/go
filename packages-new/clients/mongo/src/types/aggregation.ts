/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Filter } from 'mongodb';

import { type OptionalIf } from '@tmlmobilidade/types';

interface MatchStage<T> { $match: Filter<T> }
interface ProjectStage<T> { $project: Partial<Record<keyof T, 0 | 1> | Record<string, 0 | 1>> }
interface GroupStage {
	$group: {
		[key: string]: any
		_id: Record<string, any> | string
	}
}
interface ReplaceRootStage { $replaceRoot: { newRoot: Record<string, any> | string } }
interface SortStage<T> { $sort: Partial<Record<keyof T, -1 | 1> | Record<string, -1 | 1>> }
interface LimitStage { $limit: number }
interface SkipStage { $skip: number }
interface UnwindStage { $unwind: string | { path: string, preserveNullAndEmptyArrays: boolean } }
interface AddFieldsStage { $addFields: Record<string, any> }
interface LookupStage {
	$lookup: OptionalIf<{
		as: string
		foreignField?: string
		from: string
		let?: Record<string, any>
		localField?: string
		pipeline?: any[]
	}, 'pipeline', 'foreignField' | 'localField'>
}
interface SetStage { $set: Record<string, any> }
interface UnsetStage { $unset: string | string[] }

type AggregationStage<T> =
  | AddFieldsStage
  | GroupStage
  | LimitStage
  | LookupStage
  | MatchStage<T>
  | ProjectStage<T>
  | ReplaceRootStage
  | SetStage
  | SkipStage
  | SortStage<T>
  | UnsetStage
  | UnwindStage;

export type AggregationPipeline<T> = AggregationStage<T>[];
