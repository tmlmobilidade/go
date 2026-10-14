/* * */

import { type Agency } from '@tmlmobilidade/go-types-core';
import { isRuleSeverity, ruleCatalogue, type RuleCatalogueEntry, type RuleSeverity } from '@tmlmobilidade/go-types-gtfs-validator';

/* * */

//
// A. Define the agency input and report cell types

type ReportAgency = Pick<Agency, '_id' | 'short_name'> & { plans?: { validation_rules?: unknown } };
type CellState = 'fixed' | 'invalid' | 'missing' | RuleSeverity;
interface Cell { label: string, state: CellState, title: string }

const severityLabels: Record<RuleSeverity, string> = {
	error: 'Erro',
	forbidden: 'Proibido',
	ignore: 'Ignorado',
	warning: 'Aviso',
};

/* * */

/**
 * Configuration sections must be objects, excluding null and arrays.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/* * */

/**
 * Escape dynamic text used in HTML content and quoted attributes.
 */
function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, char => ({ '\'': '&#39;', '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] ?? char);
}

/* * */

/**
 * Accept object and JSON-string storage formats while distinguishing absent from invalid settings.
 */
function parseRules(value: unknown): { invalid: boolean, rules: Record<string, unknown> } {
	try {
		const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value;
		if (parsed === null || parsed === undefined) return { invalid: false, rules: {} };
		return isRecord(parsed) ? { invalid: false, rules: parsed } : { invalid: true, rules: {} };
	} catch {
		return { invalid: true, rules: {} };
	}
}

/* * */

/**
 * Resolve one catalogue rule for one agency without replacing missing settings with defaults.
 */
function getCell(config: ReturnType<typeof parseRules>, entry: RuleCatalogueEntry): Cell {
	//
	// A. Resolve fixed notices from the catalogue

	if (!entry.editable) {
		const severities = entry.severities ?? (entry.severity ? [entry.severity] : []);
		return { label: severities.map(severity => severityLabels[severity]).join(' / '), state: 'fixed', title: 'Aviso técnico: severidade definida pelo validador, não configurável por operador.' };
	}
	const path = `${entry.group}.${entry.config_key}`;
	const invalid: Cell = { label: 'Inválido', state: 'invalid', title: `${path}: configuração ou severidade inválida.` };
	const missing: Cell = { label: 'Não configurado', state: 'missing', title: `${path}: configuração em falta. Não equivale a uma regra explicitamente ignorada.` };

	//
	// B. Distinguish missing settings from invalid configuration shapes

	if (config.invalid) return invalid;
	if (!(entry.group in config.rules)) return missing;
	const section = config.rules[entry.group];
	if (!isRecord(section)) return invalid;
	if (!(entry.config_key in section)) return missing;

	//
	// C. Read and validate the configured severity

	const value = section[entry.config_key];
	if (entry.config_key !== '_file' && !isRecord(value)) return invalid;
	const severity = entry.config_key === '_file' ? value : (value as Record<string, unknown>).severity;
	if (!isRuleSeverity(severity)) return invalid;
	return { label: severityLabels[severity], state: severity, title: `${path}: ${severity}` };
}

/* * */

/**
 * Render a standalone HTML snapshot comparing every catalogue rule across agencies.
 * Styles and filtering are embedded so the report can be opened without a server.
 */
export function renderAgencyValidationRulesReport(agencies: ReportAgency[], generatedAt = new Date()): string {
	//
	// A. Sort a copy of the agencies and parse their settings

	const columns = [...agencies]
		.sort((a, b) => a._id.localeCompare(b._id, 'pt', { numeric: true }))
		.map(agency => ({ ...agency, config: parseRules(agency.plans?.validation_rules) }));

	//
	// B. Initialize the rule-level summary counters

	let differences = 0;
	let ignored = 0;
	let incomplete = 0;

	//
	// C. Render every catalogue rule across all agencies

	const rows = ruleCatalogue.map((entry) => {
		const cells = columns.map(agency => getCell(agency.config, entry));

		//
		// A. Compare cell states and identify ignored or incomplete settings

		const different = new Set(cells.map(cell => cell.state)).size > 1;
		const hasIgnored = cells.some(cell => cell.state === 'ignore');
		const hasIncomplete = cells.some(cell => cell.state === 'missing' || cell.state === 'invalid');

		//
		// B. Update summary counts and render the row with its filter flags

		if (different) differences++;
		if (hasIgnored) ignored++;
		if (hasIncomplete) incomplete++;
		return `<tr data-different="${different}" data-ignored="${hasIgnored}" data-incomplete="${hasIncomplete}" data-search="${escapeHtml(`${entry.group} ${entry.id}`)}">
			<th scope="row"><code>${escapeHtml(entry.id)}</code><small>${escapeHtml(entry.group)}${entry.editable ? '' : ' · Fixo'}${different ? ' · Diferenças' : ''}</small></th>
			${cells.map(cell => `<td><span class="badge ${cell.state}" title="${escapeHtml(cell.title)}">${escapeHtml(cell.label)}</span></td>`).join('')}
		</tr>`;
	}).join('\n');

	//
	// D. Assemble the standalone HTML report with styles and filtering

	return `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Regras de validação por operador</title>
<style>
* { box-sizing: border-box; }
body { margin: 0; padding: 28px; color: #182630; background: #f4f6f8; font: 14px/1.5 system-ui, sans-serif; }
h1 { margin: 0 0 8px; font-size: 26px; }
p { margin: 8px 0; color: #52616b; }
.summary, .controls, .legend { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; align-items: center; }
.summary span { padding: 10px 14px; background: white; border: 1px solid #dce3e8; border-radius: 8px; }
label { display: flex; align-items: center; gap: 8px; }
input, select { padding: 8px 10px; border: 1px solid #aab8c2; border-radius: 6px; font: inherit; background: white; color: inherit; }
input { width: min(350px, 65vw); }
.table-wrap { max-height: 70vh; overflow: auto; border: 1px solid #cbd5dc; border-radius: 8px; background: white; }
table { border-spacing: 0; width: 100%; }
th, td { padding: 12px 16px; border-bottom: 1px solid #e1e7eb; border-right: 1px solid #e1e7eb; text-align: center; }
thead th { position: sticky; top: 0; background: #eaf0f4; z-index: 2; min-width: 155px; }
th:first-child { position: sticky; left: 0; text-align: left; background: #f5f8fa; min-width: 300px; max-width: 440px; z-index: 1; }
thead th:first-child { z-index: 3; background: #eaf0f4; }
code { font-size: 12px; overflow-wrap: anywhere; }
small { display: block; font-size: 12px; font-weight: normal; color: #52616b; margin-top: 4px; }
tr[data-different="true"] th { box-shadow: inset 4px 0 #2563eb; }
tbody tr:hover td { background: #f8fafc; }
.badge { display: inline-block; padding: 4px 9px; border-radius: 5px; font-size: 12px; font-weight: 650; white-space: nowrap; }
.error { color: #9b1c1c; background: #fee2e2; }
.warning { color: #854d0e; background: #fef3c7; }
.ignore { color: #475569; background: #e2e8f0; }
.forbidden { color: #6b21a8; background: #f3e8ff; }
.missing { color: #075985; background: #e0f2fe; border: 1px dashed #0284c7; }
.invalid { color: #9a3412; background: #ffedd5; border: 1px dashed #c2410c; }
.fixed { color: #334155; background: #f1f5f9; }
[hidden] { display: none !important; }
#empty { padding: 20px; }
@media (max-width: 600px) { body { padding: 12px; } th:first-child { min-width: 220px; max-width: 250px; } }
</style>
</head>
<body>
<h1>Regras de validação por operador</h1>
<p>Comparação das severidades guardadas por operador. Gerado em ${escapeHtml(generatedAt.toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' }))} (Europe/Lisbon).</p>
<div class="summary">
<span><strong>${columns.length}</strong> operadores</span><span><strong>${ruleCatalogue.length}</strong> regras</span>
<span><strong>${differences}</strong> com diferenças</span><span><strong>${ignored}</strong> com operadores a ignorar</span><span><strong>${incomplete}</strong> por configurar ou corrigir</span>
</div>
<p>«Ignorado» indica uma regra desativada explicitamente. «Não configurado» indica uma regra em falta; o validador exige a configuração completa. «Inválido» indica um valor que precisa de correção.</p>
<p>As linhas «Fixo» são avisos técnicos do validador. A comparação considera apenas severidades, não opções nem dependências. Este relatório é uma fotografia dos dados e não altera configurações.</p>
<div class="controls">
<label for="search">Pesquisar regra <input id="search" type="search" placeholder="rule_id ou ficheiro"></label>
<label for="filter">Mostrar <select id="filter">
<option value="all">Todas as regras</option><option value="different">Com diferenças entre operadores</option>
<option value="ignored">Ignoradas por algum operador</option><option value="incomplete">Não configuradas ou inválidas</option>
</select></label>
<span id="count" role="status">${ruleCatalogue.length} de ${ruleCatalogue.length} regras</span>
</div>
<div class="legend" aria-label="Legenda">${Object.entries(severityLabels).map(([state, label]) => `<span class="badge ${state}">${label}</span>`).join('')}<span class="badge missing">Não configurado</span><span class="badge invalid">Inválido</span><span class="badge fixed">Fixo</span></div>
<div class="table-wrap" tabindex="0" role="region" aria-label="Comparação de regras por operador">
<table>
<thead><tr><th scope="col">rule_id / ficheiro</th>${columns.map(agency => `<th scope="col">${escapeHtml(agency._id)}<small>${escapeHtml(agency.short_name || 'Sem nome abreviado')}</small></th>`).join('')}</tr></thead>
<tbody>${rows}</tbody>
</table>
<p id="empty" hidden>Nenhuma regra corresponde aos filtros.</p>
</div>
<script>
const search = document.getElementById('search');
const filter = document.getElementById('filter');
const rows = Array.from(document.querySelectorAll('tbody tr'));
function update() {

  //
  // A. Filter rows by search text and the selected configuration state

  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const row of rows) {
    row.hidden = !row.dataset.search.toLowerCase().includes(query) || (filter.value !== 'all' && row.dataset[filter.value] !== 'true');
    if (!row.hidden) visible++;
  }

  //
  // B. Update the visible count and empty-state message

  document.getElementById('count').textContent = visible + ' de ' + rows.length + ' regras';
  document.getElementById('empty').hidden = visible !== 0;
}
search.addEventListener('input', update);
filter.addEventListener('change', update);
</script>
</body>
</html>`;
}
