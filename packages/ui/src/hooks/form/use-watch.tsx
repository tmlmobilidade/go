'use client';

// This file re-exports the useWatch hook from react-hook-form,
// allowing it to be imported from this module instead of directly from react-hook-form.
// This removes the need to declare react-hook-form as a dependency in modules code.

export { useWatch as useContextFormWatch } from 'react-hook-form';

