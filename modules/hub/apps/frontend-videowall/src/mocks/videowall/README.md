# Videowall mock data

The videowall can replace both metrics API responses with type-checked local
fixtures. Live data remains the default.

Edit `config.ts` and change the exported `VIDEOWALL_DATA_CONFIG`:

```ts
export const VIDEOWALL_DATA_CONFIG: VideowallDataConfig = {
	data_source: 'mock',
	mock_scenario: 'regular',
	mock_state: 'ready',
};
```

The fields are typed unions, so the available values appear in editor
autocomplete and invalid options fail TypeScript checks.

## Data source

- `live`: fetch the Hub API.
- `mock`: skip both API requests and use local fixtures.

## Scenarios

- `excellent`: demand above its reference range, very low service failures and
  delays, and near-complete distance delivery.
- `regular`: demand inside its reference range and ordinary service delivery.
- `bad`: demand below its reference range, high service failures and delays,
  reduced distance delivery, and a visible afternoon demand dip.
- `unavailable`: agency and selected-set values are unavailable.

## UI states

- `ready`: fixture data is available.
- `loading`: no data is exposed and cards render their loading state.
- `validating`: fixture data remains visible while cards render their refresh
  state.
- `error`: no data is exposed and context error flags are set.

The fixture factory returns `PassengerDemandMetrics` and `VideowallMetrics`.
Changes to the public response types therefore fail TypeScript checks and the
mock schema regression test.

## Determinism

The fixture values are deterministic: the factory does not use random numbers.
Given the same scenario, operational day, and requested agency IDs, it produces
the same metric values and trend shape.

The generated operational dates and timestamps follow the current operational
day, so those fields change over time. Per-agency values can also change when
the requested agency set changes because the configured agency weights are
normalised across that set.
