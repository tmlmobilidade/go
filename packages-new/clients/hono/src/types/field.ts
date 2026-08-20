export type ClickhouseField<T extends object> = Extract<keyof T, string>;
