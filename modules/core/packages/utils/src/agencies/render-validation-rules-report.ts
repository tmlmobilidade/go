/* * */

import { type Agency } from '@tmlmobilidade/go-types-core';
import { type GtfsValidatorRuleId, GtfsValidatorRuleIdValues } from '@tmlmobilidade/go-types-gtfs-validator';
import { type SeverityStatus, SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';

/* * */

//
// A. Define the agency input and report cell types

type ReportAgency = Pick<Agency, '_id' | 'name' | 'short_name'> & { plans?: { validation_rules?: unknown } };
type CellState = 'invalid' | 'missing' | SeverityStatus;
interface Cell { label: string, state: CellState, title: string }

const severityLabels: Record<SeverityStatus, string> = {
	error: 'Erro',
	ignore: 'Ignorado',
	info: 'Informação',
	warning: 'Aviso',
};

// File-level IDs provide the table names, including names containing underscores.
const ruleFiles = GtfsValidatorRuleIdValues
	.filter(id => id.endsWith('_file_missing'))
	.map(id => id.slice(0, -'_file_missing'.length))
	.sort((a, b) => b.length - a.length);

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
 * Resolve one generated rule for one agency without replacing missing settings with defaults.
 */
function getCell(config: ReturnType<typeof parseRules>, ruleId: GtfsValidatorRuleId): Cell {
	const invalid: Cell = { label: 'Inválido', state: 'invalid', title: `${ruleId}: configuração ou severidade inválida.` };
	const missing: Cell = { label: 'Não configurado', state: 'missing', title: `${ruleId}: configuração em falta. Não equivale a uma regra explicitamente ignorada.` };

	if (config.invalid) return invalid;
	if (!Object.hasOwn(config.rules, ruleId)) return missing;
	const rule = config.rules[ruleId];
	if (!isRecord(rule)) return invalid;
	const severity = SeverityStatusSchema.safeParse(rule.severity);
	if (!severity.success) return invalid;
	return { label: severityLabels[severity.data], state: severity.data, title: `${ruleId}: ${severity.data}` };
}

/* * */

/**
 * Render a standalone HTML snapshot comparing every generated rule across agencies.
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
	// C. Render every generated rule across all agencies

	const rows = GtfsValidatorRuleIdValues.map((ruleId) => {
		const group = ruleFiles.find(file => ruleId.startsWith(`${file}_`)) ?? 'Geral';
		const cells = columns.map(agency => getCell(agency.config, ruleId));

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
		return `<tr data-different="${different}" data-ignored="${hasIgnored}" data-incomplete="${hasIncomplete}" data-search="${escapeHtml(`${group} ${ruleId}`)}">
			<th scope="row"><code>${escapeHtml(ruleId)}</code><small>${escapeHtml(group)}<span data-difference-label${different ? '' : ' hidden'}> · Diferenças</span></small></th>
			${cells.map((cell, index) => `<td data-agency="${index}" data-state="${cell.state}"><span class="badge ${cell.state}" title="${escapeHtml(cell.title)}">${escapeHtml(cell.label)}</span></td>`).join('')}
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
input[type="search"] { width: min(350px, 65vw); }
.agency-picker { position: relative; }
.agency-picker summary { padding: 8px 12px; border: 1px solid #aab8c2; border-radius: 6px; background: white; cursor: pointer; }
.agency-picker[open] summary { border-color: #2563eb; }
.agency-panel { position: absolute; top: calc(100% + 8px); left: 0; z-index: 4; width: min(360px, calc(100vw - 56px)); padding: 12px; border: 1px solid #cbd5dc; border-radius: 8px; background: white; box-shadow: 0 8px 24px #18263026; }
.agency-list { display: flex; flex-direction: column; gap: 4px; max-height: 260px; overflow: auto; margin-top: 12px; }
.agency-list label { padding: 8px; border-radius: 4px; cursor: pointer; overflow-wrap: anywhere; }
.agency-list label:hover { background: #f4f6f8; }
.agency-list input { flex-shrink: 0; }
.agency-actions { display: flex; gap: 8px; }
.agency-actions button { padding: 6px 12px; border: 1px solid #aab8c2; border-radius: 6px; background: white; font: inherit; cursor: pointer; }
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
.info { color: #075985; background: #e0f2fe; }
.missing { color: #075985; background: #e0f2fe; border: 1px dashed #0284c7; }
.invalid { color: #9a3412; background: #ffedd5; border: 1px dashed #c2410c; }
[hidden] { display: none !important; }
#empty { padding: 20px; }
@media (max-width: 600px) { body { padding: 12px; } th:first-child { min-width: 220px; max-width: 250px; } }
</style>
</head>
<body>
<h1>Regras de validação por operador</h1>
<p>Comparação das severidades guardadas por operador. Gerado em ${escapeHtml(generatedAt.toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' }))} (Europe/Lisbon).</p>
<div class="summary">
<span><strong id="agency-count">${columns.length}</strong> operadores selecionados</span><span><strong>${GtfsValidatorRuleIdValues.length}</strong> regras</span>
<span><strong id="differences-count">${differences}</strong> com diferenças</span><span><strong id="ignored-count">${ignored}</strong> com operadores a ignorar</span><span><strong id="incomplete-count">${incomplete}</strong> por configurar ou corrigir</span>
</div>
<p>«Ignorado» indica uma regra desativada explicitamente. «Não configurado» indica uma regra em falta; o validador ignora regras sem configuração. «Inválido» indica um valor que precisa de correção.</p>
<p>A comparação considera apenas severidades, não opções nem dependências. Este relatório é uma fotografia dos dados e não altera configurações.</p>
<div class="controls">
<details class="agency-picker" id="agency-picker">
<summary>Operadores (<span id="agency-selection-count">${columns.length}</span>)</summary>
<div class="agency-panel">
<div class="agency-actions"><button type="button" id="agencies-all">Selecionar todos</button><button type="button" id="agencies-none">Limpar seleção</button></div>
<div class="agency-list">${columns.map((agency, index) => `<label><input type="checkbox" name="agency" value="${index}" checked> ${escapeHtml(agency._id)} · ${escapeHtml(agency.short_name || agency.name || 'Sem nome')}</label>`).join('')}</div>
</div>
</details>
<label for="search">Pesquisar regra <input id="search" type="search" placeholder="rule_id ou ficheiro"></label>
<label for="filter">Mostrar <select id="filter">
<option value="all">Todas as regras</option><option value="different">Com diferenças entre operadores</option>
<option value="ignored">Ignoradas por algum operador</option><option value="incomplete">Não configuradas ou inválidas</option>
</select></label>
<span id="count" role="status">${GtfsValidatorRuleIdValues.length} de ${GtfsValidatorRuleIdValues.length} regras</span>
</div>
<div class="legend" aria-label="Legenda">${Object.entries(severityLabels).map(([state, label]) => `<span class="badge ${state}">${label}</span>`).join('')}<span class="badge missing">Não configurado</span><span class="badge invalid">Inválido</span></div>
<div class="table-wrap" tabindex="0" role="region" aria-label="Comparação de regras por operador">
<table>
<thead><tr><th scope="col">rule_id / ficheiro</th>${columns.map((agency, index) => `<th data-agency="${index}" scope="col">${escapeHtml(agency._id)}<small>${escapeHtml(agency.short_name || agency.name || 'Sem nome')}</small></th>`).join('')}</tr></thead>
<tbody>${rows}</tbody>
</table>
<p id="empty" hidden>Nenhuma regra corresponde aos filtros.</p>
</div>
<script>
const search = document.getElementById('search');
const filter = document.getElementById('filter');
const rows = Array.from(document.querySelectorAll('tbody tr'));
const agencyInputs = Array.from(document.querySelectorAll('input[name="agency"]'));
const agencyColumns = Array.from(document.querySelectorAll('[data-agency]'));
function update() {

  //
  // A. Show selected agency columns and recalculate comparison flags

  const selected = new Set(agencyInputs.filter(input => input.checked).map(input => input.value));
  for (const cell of agencyColumns) cell.hidden = !selected.has(cell.dataset.agency);
  let differences = 0;
  let ignored = 0;
  let incomplete = 0;
  for (const row of rows) {
    const states = Array.from(row.querySelectorAll('td[data-agency]'))
      .filter(cell => selected.has(cell.dataset.agency))
      .map(cell => cell.dataset.state);
    const different = new Set(states).size > 1;
    const hasIgnored = states.includes('ignore');
    const hasIncomplete = states.includes('missing') || states.includes('invalid');
    row.dataset.different = String(different);
    row.dataset.ignored = String(hasIgnored);
    row.dataset.incomplete = String(hasIncomplete);
    row.querySelector('[data-difference-label]').hidden = !different;
    if (different) differences++;
    if (hasIgnored) ignored++;
    if (hasIncomplete) incomplete++;
  }
  document.getElementById('agency-count').textContent = selected.size;
  document.getElementById('agency-selection-count').textContent = selected.size;
  document.getElementById('differences-count').textContent = differences;
  document.getElementById('ignored-count').textContent = ignored;
  document.getElementById('incomplete-count').textContent = incomplete;

  //
  // B. Filter rows by search text and the selected configuration state

  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const row of rows) {
    row.hidden = selected.size === 0 || !row.dataset.search.toLowerCase().includes(query) || (filter.value !== 'all' && row.dataset[filter.value] !== 'true');
    if (!row.hidden) visible++;
  }

  //
  // C. Update the visible count and empty-state message

  document.getElementById('count').textContent = visible + ' de ' + rows.length + ' regras';
  document.getElementById('empty').hidden = visible !== 0;
  document.getElementById('empty').textContent = selected.size === 0
    ? 'Selecione pelo menos um operador.'
    : 'Nenhuma regra corresponde aos filtros.';
}
search.addEventListener('input', update);
filter.addEventListener('change', update);

//
// Close the agency list when clicking outside or pressing Escape

const agencyPicker = document.getElementById('agency-picker');
document.addEventListener('click', event => {
  if (!agencyPicker.contains(event.target)) agencyPicker.open = false;
});
agencyPicker.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    agencyPicker.open = false;
    agencyPicker.querySelector('summary').focus();
  }
});
for (const input of agencyInputs) input.addEventListener('change', update);
for (const [id, checked] of [['agencies-all', true], ['agencies-none', false]]) {
  document.getElementById(id).addEventListener('click', () => {
    for (const input of agencyInputs) input.checked = checked;
    update();
  });
}
update();
</script>
</body>
</html>`;
}
