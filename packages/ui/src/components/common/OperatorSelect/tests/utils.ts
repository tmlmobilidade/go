/* * */

import assert from 'node:assert/strict';

import { DEFAULT_OPERATOR_SELECT_GROUPS } from '../groups';
import { buildOperatorSelectTree, buildOperatorTreeNodes, filterLeafCheckedState, getOperatorDisplayName } from '../utils';

/* * */

const options = [
	{ code: '41', id: 'LA77N', name: 'Viação Alvorada', public_name: 'Carris Metropolitana', short_name: 'VA' },
	{ code: '42', id: 'BNA17', name: 'Rodoviária de Lisboa', public_name: 'Carris Metropolitana', short_name: 'RL' },
	{ code: '44', id: 'A2L1N', name: 'Alsa Todi', public_name: 'Carris Metropolitana', short_name: 'ALSA' },
	{ code: '43', id: 'YA15B', name: 'Transportes Sul do Tejo', public_name: 'Carris Metropolitana', short_name: 'TST' },
	{ code: '1', id: 'IA9T6', name: 'Carris', public_name: 'CARRIS', short_name: 'CCFL' },
	{ code: 'UT1', id: 'KJTOU', name: 'Vianorbus', public_name: 'Unir' },
];

const tree = buildOperatorSelectTree(options, DEFAULT_OPERATOR_SELECT_GROUPS);
const nodes = buildOperatorTreeNodes(tree);

assert.equal(tree.groups[0]?.label, 'Carris Metropolitana');
assert.deepEqual(tree.groups[0]?.members.map(item => item.short_name), ['VA', 'RL', 'ALSA', 'TST']);
assert.equal(tree.groups[1]?.label, 'Unir');
assert.deepEqual(tree.ungrouped.map(item => item.id), ['IA9T6']);
assert.equal(nodes[0]?.value, 'carris-metropolitana');
assert.deepEqual(nodes[0]?.children?.map(item => item.value), ['LA77N', 'BNA17', 'A2L1N', 'YA15B']);
assert.equal(getOperatorDisplayName(options[0], 'Carris Metropolitana'), 'Viação Alvorada');
assert.equal(getOperatorDisplayName(options[4]), 'CARRIS');
assert.deepEqual(
	filterLeafCheckedState(['carris-metropolitana', 'LA77N', 'BNA17'], options.map(item => item.id)),
	['LA77N', 'BNA17'],
);
