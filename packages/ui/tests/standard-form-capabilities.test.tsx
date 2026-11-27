import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useStandardFormCapabilities } from '../src/form/standard-form-context/use-standard-form-capabilities';

/* * */

type CapabilitiesProps = Parameters<typeof useStandardFormCapabilities>[0];

function SaveButton(props: CapabilitiesProps) {
	const { updateEnabled } = useStandardFormCapabilities(props);
	return createElement('button', { disabled: !updateEnabled }, 'Save');
}

function canAttemptSave(props: CapabilitiesProps) {
	return !renderToStaticMarkup(createElement(SaveButton, props)).includes('disabled');
}

/* * */

test('validation on submit allows retrying Save while cached form errors remain', () => {
	const props = { form: { isDirty: true, isValid: false }, update: { hasPermission: true } };
	assert.equal(canAttemptSave(props), false);
	assert.equal(canAttemptSave({ ...props, update: { ...props.update, validateOnSubmit: true } }), true);
});

test('validation on submit still respects permission, loading, locking and unsaved changes', () => {
	const props = { form: { isDirty: true, isValid: false }, update: { hasPermission: true, validateOnSubmit: true } };
	assert.equal(canAttemptSave({ ...props, update: { ...props.update, hasPermission: false } }), false);
	assert.equal(canAttemptSave({ ...props, loading: { isLoading: true } }), false);
	assert.equal(canAttemptSave({ ...props, locked: { isLocked: true } }), false);
	assert.equal(canAttemptSave({ ...props, form: { isDirty: false, isValid: true } }), false);
});
