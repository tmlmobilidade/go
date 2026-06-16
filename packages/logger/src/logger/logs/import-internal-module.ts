export function importInternalModule<Module>(specifier: string): Promise<Module> {
	const dynamicImport = new Function('specifier', 'return import(specifier)') as (moduleSpecifier: string) => Promise<Module>;
	return dynamicImport(specifier);
}
