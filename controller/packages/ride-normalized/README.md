# @tmlmobilidade/sae-controller-pckg-ride-normalized

Pacote para normalização de circulações (rides), adicionando propriedades computadas para visualização e análise.

## Descrição

Este pacote estende o tipo `Ride` base com propriedades adicionais que facilitam a apresentação de informação e análise de circulações no sistema. A normalização adiciona campos como status operacional, status de atraso, e formatação de horários.

## Instalação

```bash
npm install @tmlmobilidade/sae-controller-pckg-ride-normalized
```

## Uso

```typescript
import { normalizeRide, type RideNormalized } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';

// Normalizar uma circulação
const ride: Ride = { /* ... */ };
const normalizedRide: RideNormalized = normalizeRide(ride);
```

## Tipo RideNormalized

O tipo `RideNormalized` estende o tipo `Ride` base com as seguintes propriedades adicionais:

### Propriedades de Status

#### `operational_status`
- **Tipo**: `'ended' | 'missed' | 'running' | 'scheduled'`
- **Descrição**: Status operacional da circulação
  - `scheduled`: Hora de início ainda está no futuro e não há eventos de veículo
  - `missed`: Hora de início passou há pelo menos 10 minutos e não há eventos de veículo
  - `running`: Último evento de veículo foi há menos de 10 minutos
  - `ended`: Último evento de veículo foi há mais de 10 minutos

#### `seen_status`
- **Tipo**: `'gone' | 'seen' | 'unseen'`
- **Descrição**: Status de visibilidade da circulação
  - `seen`: Último evento foi há menos de 30 segundos
  - `gone`: Último evento foi há mais de 30 segundos
  - `unseen`: Não há eventos registados

#### `acceptance_status`
- **Tipo**: `'none' | 'accepted' | 'rejected'`
- **Descrição**: Status de aceitação da circulação pelo sistema

### Propriedades de Atraso

#### `start_delay_status`
- **Tipo**: `'delayed' | 'early' | 'ontime' | 'none'`
- **Descrição**: Status de atraso no início da circulação
  - `delayed`: Mais de 5 minutos de atraso
  - `early`: Mais de 1 minuto adiantado
  - `ontime`: Dentro do intervalo normal
  - `none`: Sem informação de horário observado

#### `start_delay_value_display`
- **Tipo**: `string | null`
- **Descrição**: Valor formatado do atraso no início (ex: "5m 30s", "-2m 15s")

#### `end_delay_status`
- **Tipo**: `'delayed' | 'early' | 'ontime' | 'none'`
- **Descrição**: Status de atraso no fim da circulação (mesma lógica que `start_delay_status`)

#### `end_delay_value_display`
- **Tipo**: `string | null`
- **Descrição**: Valor formatado do atraso no fim

#### `delay_status` ⚠️ DEPRECADO
- **Tipo**: `'delayed' | 'early' | 'ontime' | 'none'`
- **Descrição**: Status de atraso (usar `start_delay_status` em alternativa)

#### `delay_value_display` ⚠️ DEPRECADO
- **Tipo**: `string | null`
- **Descrição**: Valor formatado do atraso (usar `start_delay_value_display` em alternativa)

### Propriedades de Horário

#### `start_time_scheduled_display`
- **Tipo**: `string`
- **Descrição**: Hora de início planeada formatada (formato: "HH:mm", timezone: Europe/Lisbon)

#### `start_time_observed_display`
- **Tipo**: `string | null`
- **Descrição**: Hora de início observada formatada (formato: "HH:mm", timezone: Europe/Lisbon)

#### `end_time_scheduled_display`
- **Tipo**: `string`
- **Descrição**: Hora de fim planeada formatada (formato: "HH:mm", timezone: Europe/Lisbon)

#### `end_time_observed_display`
- **Tipo**: `string | null`
- **Descrição**: Hora de fim observada formatada (formato: "HH:mm", timezone: Europe/Lisbon)

### Propriedades de Análise

Todas as propriedades de análise têm o tipo `'none' | RideAnalysis['grade']` onde o grade pode ser `'valid'`, `'warning'`, `'error'`, etc.

#### `analysis_ended_at_last_stop_grade`
- **Descrição**: Grau de análise se a circulação terminou na última paragem

#### `analysis_expected_apex_validation_interval`
- **Descrição**: Grau de análise do intervalo de validação esperado no apex

#### `analysis_simple_three_vehicle_events_grade`
- **Descrição**: Grau de análise dos três eventos de veículo simples

#### `analysis_transaction_sequentiality`
- **Descrição**: Grau de análise da sequencialidade das transações

**Nota**: Estas propriedades retornam `'none'` quando o `operational_status` é `'scheduled'` ou `'running'`.

## Funções Auxiliares

### `normalizeRide(ride: Ride): RideNormalized`

Função principal que normaliza um objeto `Ride` adicionando todas as propriedades computadas.

```typescript
const normalizedRide = normalizeRide(ride);
```

### `getOperationalStatus(startTimeScheduled, seenLastAt): OperationalStatus`

Determina o status operacional da circulação baseado na hora de início planeada e no último evento observado.

### `getSeenStatus(seenLastAt): SeenStatus`

Determina o status de visibilidade da circulação baseado no timestamp do último evento.

### `getDelayStatus(timeScheduled, timeObserved): DelayStatus`

Calcula o status de atraso comparando a hora planeada com a hora observada.

### `getDelayValueDisplay(timeScheduled, timeObserved): string | null`

Formata a diferença entre hora planeada e observada num formato legível (ex: "5m 30s").

### `getAnalysisGrade(operationalStatus, grade): Grade`

Retorna o grau de análise apropriado baseado no status operacional da circulação.

## Constantes Exportadas

```typescript
// Status operacionais possíveis
export const operationalStatusOptions = ['ended', 'missed', 'running', 'scheduled'] as const;
export const operationalStatusValues = [...operationalStatusOptions];

// Status de atraso possíveis
export const delayStatusOptions = ['delayed', 'early', 'ontime', 'none'] as const;
export const delayStatusValues = [...delayStatusOptions];

// Status de visibilidade possíveis
export const seenStatusOptions = ['gone', 'seen', 'unseen'] as const;
export const seenStatusValues = [...seenStatusOptions];
```

## Regras de Negócio

### Cálculo de Status Operacional

1. **Scheduled**: Hora de início é no futuro ou passou há menos de 10 minutos E não há eventos de veículo
2. **Missed**: Hora de início passou há mais de 10 minutos E não há eventos de veículo
3. **Running**: Há eventos de veículo E o último foi há menos de 10 minutos
4. **Ended**: Há eventos de veículo E o último foi há mais de 10 minutos

### Cálculo de Status de Atraso

1. **Delayed**: Diferença > 5 minutos (300,000ms)
2. **Early**: Diferença < -1 minuto (-60,000ms)
3. **Ontime**: Diferença entre -1 minuto e 5 minutos
4. **None**: Sem horário observado disponível

### Cálculo de Status de Visibilidade

1. **Seen**: Último evento há menos de 30 segundos
2. **Gone**: Último evento há mais de 30 segundos
3. **Unseen**: Sem eventos registados

## Timezone

Todas as formatações de horário usam o timezone `Europe/Lisbon` com modo `offset_only`.

## Dependências

- `@tmlmobilidade/types`: Tipos base do sistema
- `@tmlmobilidade/utils`: Utilitários, incluindo manipulação de datas

## Licença

Proprietary - Uso interno TML Mobilidade
