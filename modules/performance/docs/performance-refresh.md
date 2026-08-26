# GO Performance: product and information architecture

Status: product exploration
Scope: multimodal public-transport performance for authorities, operators, planners, contract managers, and analysts

## Product map at a glance

GO Performance is imagined as a workspace with several complementary entry points. Pulse surfaces what deserves attention; question pages explain network-wide outcomes; entity dossiers preserve context while users drill into evidence; investigations and reviews turn findings into follow-up; Explorer supports open-ended analysis.

```text
GO Performance
├─ Pulse
├─ Understand
│  ├─ What changed?
│  ├─ Are passengers being served?
│  ├─ Was planned service delivered?
│  ├─ Why is service unreliable?
│  └─ What should we change?
├─ Network
│  ├─ Service
│  │  ├─ Line
│  │  │  ├─ Route / direction
│  │  │  │  └─ Pattern
│  │  │  │     └─ Dated trip / circulation
│  │  │  │        └─ Stop call
│  │  │  └─ History, feedback, exceptions, and actions
│  │  ├─ Corridor / segment
│  │  └─ Mode / service class
│  ├─ Places
│  │  ├─ Stop area / interchange
│  │  └─ Stop / platform
│  └─ Organisations and accountability
│     ├─ Authority / agency
│     ├─ Contract / service area
│     └─ Operator
├─ Exceptions and investigations
├─ Reviews and reports
├─ Explorer
└─ Definitions and data
```

This is a navigation model, not a strict database hierarchy. Stops can serve several lines and modes; operators can change over time; contracts connect organisations to services; a trip is a dated execution of a pattern. These relationships must be effective-dated even when the UI presents a simple drill-down.

### Pulse

The network landing page. It gives a small, honest overview of demand, delivered service, reliability, passenger impact, passenger feedback, and data confidence. A map, operator/mode comparisons, and a ranked attention list direct users to material changes and exceptions rather than presenting an opaque overall health score.

### Understand

A set of curated, question-led investigations. Each page begins with a plain-language answer, then shows contributors, where and when the result occurred, passenger impact, related evidence, and possible next actions.

- **What changed?** Finds meaningful increases, decreases, anomalies, and persistent changes; identifies which operators, lines, patterns, stops, time bands, or feedback themes explain them.
- **Are passengers being served?** Places demand beside planned and delivered supply and, when defensible data exists, capacity, occupancy, crowding, and underserved origins or areas.
- **Was planned service delivered?** Compares planned and actual trips, vehicle-km, hours, stop calls, capacity, cancellations, partial trips, early starts, and contractual targets.
- **Why is service unreliable?** Investigates punctuality or headway regularity according to the service class, then drills into run time, dwell, gaps, bunching, slow segments, delay propagation, and trip evidence.
- **What should we change?** Connects an observed problem to a planning scenario, such as changes to frequency, timetable, recovery time, capacity, span, stopping pattern, or alignment, and later verifies the outcome.

### Network and entity dossiers

The entity-first part of Performance. Selecting an entity keeps demand, supply, delivery, reliability, capacity, feedback, passenger impact, data quality, history, and comparisons attached to that context.

- **Line detail:** the central dossier and the “everything about a line” experience. It combines an overview with demand, delivery, reliability, patterns and stops, feedback, history/actions, and data-quality lenses.
- **Route/direction:** a stable directional or corridor-level grouping inside a line, useful for comparing opposite directions and service variants.
- **Pattern detail:** diagnosis along an exact ordered stop sequence. Its key views include the stop profile, stop-by-time heatmap, segment run-time distributions, space-time diagrams, and trip execution evidence.
- **Trip/circulation detail:** the audit view for one dated execution: planned and observed start/end, stop calls, delays, vehicle/capacity, execution status, deviations, incidents, and source identifiers.
- **Stop and stop-area detail:** a place-oriented view across all serving lines and modes, covering demand, delivered service, waiting and reliability, accessibility, feedback, crowding where known, and interchange/connection performance.
- **Corridor/segment detail:** a shared spatial view for speed, run time, reliability, capacity, demand, and disruptions across lines or modes.
- **Operator and contract detail:** the accountability view for planned versus delivered service, SLA attainment, recurring breaches, passenger impact, normalized feedback, investigations, commitments, and review evidence.
- **Authority/agency and mode views:** network-level aggregation and benchmarking while preserving the distinctions between who specifies the service, who operates it, and which reliability profile applies.

### Passenger feedback / passenger voice

Feedback is a cross-cutting evidence lens rather than an isolated dashboard. Individual feedback events can be associated—with explicit matching provenance and confidence—to a line, pattern, trip, stop, operator, vehicle, incident, or, under restricted governance, driver. Performance can then show volume, normalized complaint rates, category mix, trends, concentration, resolution outcomes, and changes after interventions alongside operational evidence.

Driver-level views require restricted access, exposure normalization, minimum sample sizes, privacy and labour safeguards, and an audit trail. Raw text and uncertain associations must not be exposed as broadly accessible performance scores.

### Exceptions and investigations

A ranked workspace for new, persistent, recurring, worsening, recovering, and positive exceptions. Related failures should be clustered into one operational issue with multiple evidence items. Users can preserve the analytical slice, record hypotheses and annotations, assign ownership or an intervention, and verify whether the outcome improved.

### Reviews and reports

Repeatable daily, weekly, and monthly review experiences for network management, operators, and contracts. Saved views become evidence packs or scheduled reports while retaining metric definitions, filters, comparison periods, data state, and links to the underlying entities and trips.

### Explorer

The unrestricted analytical workspace and successor to the current topic-first “Demand by…” experience. Users choose metrics, dimensions, filters, normalization, comparison cohorts, and visual forms, then save, share, or export the result. Every curated page should be able to open its current context in Explorer.

### Definitions and data

The trust layer. It contains the metric catalogue and versions, formulas, sources and lineage, targets and thresholds, supported grains and dimensions, coverage, freshness, reconciliation state, entity/network versions, observed-versus-inferred status, and known limitations.

### Shared behavior across all sections

Every section should preserve the current entity, period, comparison, day type, time band, mode, operator/contract, geography, data state, and confidence when users drill down. The same reusable metric definitions should power cards, charts, maps, alerts, reports, feedback analysis, and Explorer rather than being recalculated independently by each screen.

## Executive decision

GO Performance should stop being primarily a catalogue of metric dashboards.
It should become a performance-management workspace that connects three ideas:

1. **Questions and exceptions are the entry point.** Users start with “what changed?”, “was the service delivered?”, or “where does demand exceed capacity?”
2. **Entities are the investigation context.** Once a user selects a line, operator, pattern, stop, or trip, all relevant metrics stay attached to that entity.
3. **Metrics are reusable evidence.** Demand, supply, compliance, reliability, capacity, and passenger-impact metrics are lenses, not separate product silos.

The central product flow is:

```text
Network signal
  → ranked exception or question
  → line/operator dossier
  → route or pattern
  → stop, segment, or trip evidence
  → investigation and action
  → measured outcome
```

The central data flow remains:

```text
versioned additive facts
  → canonical metric definitions
  → entity and question read models
  → visualizations, comparisons, alerts, and reports
```

This supports the proposed “everything about a line” experience without losing network-wide comparison or open-ended analysis.

## What exists today

The current frontend is topic-first:

```text
Home
  → Demand
    → Demand by…
      → choose agency / line / pattern
      → choose day / month / year
      → view demand, product, and ticket-category charts
```

This is useful for answering a known, narrow analytical question. It becomes difficult when the real question crosses metrics, for example:

- Why is Line 4701 losing demand?
- Is the operator delivering less service, or is reliability worse?
- Is the problem shared by all routes, or isolated to one pattern and time band?
- At which stops does delay accumulate?
- How many passengers are affected?

The repository already contains useful foundations:

- accepted-validation demand by agency, line, and pattern;
- time grains by operational day, month, and year;
- demand breakdowns by product and ticket category;
- live demand projections;
- scheduled and accomplished rides and vehicle-km;
- ride-level start-delay and execution facts used by Hub;
- an older passenger-impact calculation that shows the intended direction;
- a frontend registry that already anticipates demand, supply, compliance, coverage, costs, sustainability, satisfaction, revenue, and inspections.

The main gap is not “more charts.” It is a stable product model that joins these facts into a coherent operational story.

## Market scan

The most useful lesson is to borrow capability patterns, not a competitor's navigation wholesale.

### CitySwift

CitySwift combines AVL, schedules, and ticketing, then exposes network benchmarking, punctuality, lost mileage, run-time analysis, congestion, passenger impact, origin-destination flows, occupancy/capacity, driver/block analysis, demand forecasting, and frequency or timetable simulation. Its strongest ideas for GO are demand–supply alignment, passenger-weighted impact, network pinch points, and turning observed performance into a planning scenario.

Sources: [CitySwift service definition](https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/716956/509481780404661-service-definition-document-2026-03-23-1146.pdf), [CitySwift performance-data guidance](https://www.cityswift.com/blog/planning-franchising-start-performance-data), [CitySwift platform](https://www.cityswift.com/).

### Swiftly

Swiftly separates operational diagnostic tools into on-time performance, run times, speed maps, GPS playback, operator reports, and headway insights. Its strongest ideas for GO are route/stop/trip drill-down, spatial speed and dwell views, historical playback, configurable definitions of “on time,” and using headway adherence rather than punctuality for frequent service.

Source: [Swiftly Performance Insights](https://www.goswift.ly/performance-insights).

### Optibus

Optibus positions performance inside a wider loop of planning, scheduling, operations, control, passenger information, and compliance. For authorities, it emphasizes live KPI dashboards, automated compliance reporting, scenario planning, and operator accountability. Its strongest lesson for GO is that performance should feed service design and contract management rather than end at a report.

Source: [Optibus platform](https://optibus.com/).

### Remix by Via

Remix focuses more on planning than historical operations, but adds valuable capabilities: multimodal network design, origin-destination demand, ridership forecasting, supply/demand scenarios, cost and vehicle requirements, accessibility/equity analysis, stakeholder communication, and comparison of proposed network changes. Its strongest ideas for GO are geographic context, scenario comparison, and measuring access to opportunities rather than only operational output.

Sources: [Remix](https://ridewithvia.com/solutions/remix), [Remix Ridership Modeling](https://ridewithvia.com/remix-ridership-modeling).

### Trapeze ViewPoint

Trapeze emphasizes configurable dashboards, prebuilt and ad-hoc KPIs, alerts, maps, natural-language questions, productivity metrics, and real-time/historical operator reporting. Its strongest lesson for GO is to keep an unrestricted analytical explorer alongside curated workflows.

Source: [ViewPoint for Vontas OnRoute](https://go.trapezegroup.com/rs/430-MBX-989/images/Trapeze-SolutionSheet-ViewPoint-VontasOnRoute.pdf).

### Mosaic

Public research did not identify an unambiguous current transit-performance platform called Mosaic. Several unrelated mobility, SCADA, MaaS, research, and business-planning products use the name. The exact product should be confirmed before using it as a reference.

## Three interface models considered

### Entity-first

Users begin at Network, Services, Places, or Organisations, select an entity, and inspect metric lenses. This gives the clearest mental model and best supports a complete line dossier. Its weakness is that network-wide questions such as “which lines became worse?” require a separate comparison experience.

### Question-first

Users begin with jobs such as “what changed?”, “are passengers being served?”, or “was planned service delivered?” The product gives an opinionated answer and lets the user drill into contributing entities. This is fastest for planners and contract managers, but raw metric discovery is less obvious.

### Exception/action-first

Users begin with a ranked queue of contractual breaches, persistent changes, and high passenger-impact problems. They investigate, assign an action, and verify whether it worked. This is strongest for daily and weekly performance management, but it must not hide healthy long-term trends or open-ended analysis.

### Recommended synthesis

Use all three at different moments:

- **Question/action-first home** for attention, change, delivery, passenger outcomes, and reviews.
- **Entity-first dossiers** for network, operator, line, route, pattern, trip, and stop analysis.
- **Explorer** for unrestricted metric, dimension, cohort, and comparison work.

Do not create a primary navigation item for every metric family.

## Product model

Transport entities form an effective-dated graph, not a strict tree. The UI can present familiar drill-downs while the underlying model preserves shared stops, changing operators, multiple contracts, and historical versions.

```text
Service view
Network
├─ Mode
├─ Line
│  └─ Route
│     └─ Pattern
│        └─ Dated trip / circulation
│           └─ Stop call
├─ Corridor / segment
└─ Stop area
   └─ Stop / platform

Accountability view
Authority / agency
├─ Contract / service area
│  └─ Operator
│     └─ Operated services
└─ Strategic network targets
```

Important distinctions:

- **Authority/agency and operator are not synonyms.** One specifies or publishes service; the other operates it. Contracts connect organisations to services over effective dates.
- **A line is the durable passenger-facing service.** It contains routes and patterns and is the main investigation dossier.
- **A route is a directional or corridor-level grouping.** A pattern is an exact path and ordered stop sequence.
- **A trip/circulation is a dated execution of a pattern.** Stop calls are its planned and observed events.
- **Stops and corridors are shared network places.** They must also be reachable independently of a line.
- **Mode is a behavior profile, not only a filter.** It controls which reliability and capacity measures are meaningful.

The current `agency_id`-centric model can remain supported, but the product should not hardwire `agency = operator` or `network = bus` into routes, metric definitions, or labels.

## Recommended primary navigation

### 1. Pulse

The network landing page:

- current/live service state where supported;
- yesterday or latest reconciled service result;
- important deteriorations and improvements;
- network map and mode/operator matrix;
- high passenger-impact and contractual exceptions;
- recent and saved investigations;
- visible data freshness and coverage.

Avoid one opaque “network health score.” Show demand, delivery, reliability, capacity, passenger impact, and data health separately.

### 2. Understand

Question-based entry points:

- **What changed?** Tendencies, anomalies, growth, and contribution analysis.
- **Are passengers being served?** Demand, capacity, crowding, and unmet or excess supply.
- **Was planned service delivered?** Trips, vehicle-km, hours, capacity, cancellations, starts, and contract targets.
- **Why is service unreliable?** Punctuality, headway, run time, dwell, gaps, bunching, and delay propagation.
- **What should we change?** Observed problem to scenario, assumptions, forecast outcome, and resource effect.

### 3. Network

Entity directories and global search:

- lines, routes, patterns, and trips;
- stops, stop areas, segments, corridors, and municipalities;
- modes;
- operators, agencies/authorities, contracts, and service areas.

### 4. Exceptions and investigations

- new, persistent, recurring, worsening, recovering, and positive exceptions;
- saved evidence workspaces;
- annotations and hypotheses;
- owners, commitments, and verification periods;
- related incidents, schedule changes, and known events.

This can start read-only and later grow into a full improvement workflow.

### 5. Reviews and reports

- daily operational brief;
- weekly operator review;
- monthly contract or network review;
- saved views and scheduled exports;
- evidence packs with definitions and data state.

### 6. Explorer

The successor to “Demand by…”:

- choose metric(s), dimensions, filters, normalisation, and comparison;
- table/chart/map pivots;
- save, share, and export;
- “open in Explorer” from every curated view.

### 7. Definitions and data

- metric catalogue;
- sources and lineage;
- data coverage and freshness;
- reconciliation state;
- network and schedule versions;
- known limitations.

## Global application shell

Every screen should share:

- universal entity and metric search;
- current scope breadcrumb;
- operational date/range;
- comparison baseline;
- day type and service calendar;
- time band;
- mode, operator/contract, and geography filters;
- live/provisional/reconciled/official state;
- data coverage/confidence;
- save view, compare, export, and copy-link actions.

Filters must be encoded in the URL and survive drill-down. Selecting a pattern from a line should preserve the period, comparison, day type, time band, and chosen metric lens.

Advanced filters can progressively reveal product/category, vehicle type/capacity, route, pattern, stop, incident inclusion, minimum sample, and data-quality threshold.

## The line dossier

The line is the product's central analytical object. A user should not need to visit separate Demand, Supply, and Compliance dashboards to understand it.

### Header

- line code, name, colour, mode, and active state;
- terminals and municipalities;
- authority/agency, operator, and contract;
- active service/network version and effective dates;
- route/direction and pattern chips;
- period, comparison, and data-state summary;
- compare, save, export, and share.

### One-screen overview

The first screen answers five questions:

1. How much is it used?
2. How much service and capacity were planned and delivered?
3. How reliable was the passenger experience?
4. Where and when are the main problems?
5. What changed and what likely contributed?

Recommended KPI strip:

- accepted validations/boardings and growth;
- scheduled and operated trips;
- service delivery rate;
- scheduled and operated vehicle-km;
- scheduled and delivered place-km;
- primary reliability measure for this service class;
- peak load/crowding exposure where capacity data exists;
- passenger-delay or affected-passenger measure;
- data confidence.

Every KPI should show actual value, target or expected range, comparison delta, a small trend, numerator/denominator when relevant, freshness, and coverage.

Recommended overview content:

- a short evidence-linked summary of what changed;
- an interactive line map with demand, load, delay, gap, and cancellation layers;
- aligned demand and supply trends without misleading dual axes;
- day/time heatmap switchable between demand, delivery, reliability, and capacity;
- ranked “needs attention” stops, patterns, time bands, and trips;
- pattern comparison table;
- schedule, contract, disruption, and intervention annotations on the timeline.

### Line lenses

#### Demand and passengers

- validations, boardings, inferred alightings, journeys, transfers, and passenger-km as available;
- demand growth and structural change;
- hourly, day-type, season, and directional profiles;
- product/category mix;
- boardings per trip, vehicle-km, vehicle-hour, and place-km;
- contribution of each pattern, stop, and time band to total demand and growth;
- origin-destination flows and interchange where confidence permits.

#### Supply and capacity

- scheduled and actual trips, vehicle-km, and vehicle-hours;
- service span, frequency, and scheduled/actual headway;
- scheduled and assigned vehicle type;
- seated, standing, and total capacity;
- places across a departure/time band;
- scheduled and delivered place-km;
- service and capacity added or removed over time;
- accessible-service share.

#### Delivery and contract compliance

- operated, completed, cancelled, partial, short-turned, and extra trips;
- lost and extra vehicle-km;
- missed/skipped stops and route/pattern deviation;
- early, on-time, and late starts;
- first and last trip compliance;
- scheduled versus actual capacity and vehicle type;
- applicable contract targets and repeated breaches;
- passenger-weighted impact of non-delivery.

#### Reliability and journey time

- on-time departure and arrival at relevant timing points;
- early-running and excessive-lateness rates;
- delay percentiles and distribution;
- headway adherence, gaps, bunching, and excess wait;
- scheduled versus actual run time;
- median/P90 run time and variability;
- dwell time and delay gained/lost by segment;
- layover, recovery, and terminal turnaround;
- commercial speed and slow segments;
- passenger-delay minutes and missed-connection risk.

#### Patterns, stops, and trips

- comparable table of all routes and patterns;
- stops ranked by demand, dwell, delay propagation, skipped service, and data coverage;
- trip explorer with status, vehicle, capacity, passengers, run time, and exception flags;
- deep links into the pattern and trip evidence views.

#### History and actions

- service and geometry changes;
- timetable versions;
- demand and reliability change points;
- incidents and external events;
- interventions, owners, expected effect, and before/after verification.

#### Data quality

- AVL, AFC/ticketing, APC, vehicle/capacity, and schedule coverage;
- unmatched rides, validations, trips, and stop calls;
- observed versus estimated shares;
- freshness, reconciliation, and definition versions;
- known breaks caused by entity/version changes.

## Pattern detail

The pattern page is where stop sequence and spatial diagnosis become primary.

### Signature visualization: stop profile

Use ordered stops on the x-axis with synchronized layers:

- boarding and alighting bars;
- onboard-load line;
- planned and actual capacity band;
- crowded segment highlighting;
- punctuality/headway deviation strip;
- dwell or delay-gained/lost strip.

If only validations are available, label the bars “accepted validations.” Do not imply alightings, occupancy, or distinct passengers.

### Other pattern views

- synchronized map and stop-sequence explorer;
- scheduled-versus-actual space-time diagram;
- stop × time punctuality/headway heatmap;
- segment × time run-time/speed heatmap;
- stop-level early/on-time/late distribution;
- headway distribution for frequent services;
- trip execution table;
- representative, worst, and best trip playback;
- previous pattern/service-version comparison.

The page should reveal whether a trip starts badly, loses time at a specific stop, encounters a slow segment, or suffers from an insufficient terminal recovery window. These are contributors unless a validated causal model exists.

## Trip detail

Trip detail provides audit evidence:

- planned and observed start/end;
- execution status and matching confidence;
- assigned and observed vehicle/capacity;
- stop-by-stop scheduled/actual arrival and departure;
- delay gained/lost and dwell;
- boardings/alightings/load where supported;
- skipped stops, detours, short turn, or route deviation;
- linked incident and GPS playback;
- raw source identifiers and data state.

## Stop/place detail

Stops and interchanges need their own dossier because they serve many lines and modes:

- demand, boardings, alightings, transfers, and modal interchange;
- scheduled and delivered arrivals/departures;
- wait time, headway regularity, and punctuality by line;
- dwell, crowding, skipped service, and accessibility;
- arrivals already delayed versus delay generated at this stop;
- transfer success and fragile/missed connections;
- passenger amenities and geographic/accessibility context;
- busiest and worst-performing time bands.

## Operator and contract dossier

This is an accountability view, not merely a filter over line charts:

- planned versus delivered trips, km, hours, and place-km;
- cancellations, partial trips, missed stops, and early starts;
- SLA attainment with effective-dated target definitions;
- network, mode, contract, and peer comparison;
- largest line/pattern contributors to each gap;
- passenger impact of failures;
- repeated versus new breaches;
- open investigations and commitments;
- response, due-date, and outcome verification where workflow is enabled;
- evidence export suitable for operator review.

## Question pages

Every curated question page should follow the same anatomy:

1. **Answer** — a plain-language finding, magnitude, comparison, and confidence.
2. **Contributors** — ranked entities explaining most of the result.
3. **Where and when** — map and temporal distribution.
4. **Passenger impact** — who and how many were affected.
5. **Explain** — related service, capacity, run-time, event, and data signals.
6. **Evidence** — trips, stop calls, definitions, coverage, and export.
7. **Act** — monitor, compare, save, investigate, report, or open a scenario.

### What changed?

- ranked increases/decreases and contribution waterfall;
- change-point and control charts;
- persistent change versus one-day anomaly;
- network → operator → line → pattern contribution drill-down;
- annotations for timetable versions, holidays, events, strikes, incidents, and interventions;
- comparison against previous equivalent period, last year, target, or custom cohort.

### Are passengers being served?

- demand and growth next to scheduled and actual capacity;
- demand versus delivered-places map and scatterplot;
- over/undersupply by geography, line, direction, and time;
- occupancy, crowding exposure, and duration over threshold;
- route-strip load profiles;
- growth-versus-capacity quadrant;
- places with persistent demand growth and unchanged/falling service;
- underserved origins/destinations and access gaps.

### Was planned service delivered?

- scheduled versus operated trips, km, hours, and place-km;
- completion, cancellation, short-turn, route, and stop compliance;
- early/late starts and endpoint delivery;
- target/breach matrices by operator and contract;
- passenger impact and source-trip evidence.

### Why is service unreliable?

- time-distance diagrams;
- stop × time delay/headway heatmaps;
- delay propagation and recovery;
- run-time and dwell distributions;
- terminal and layover analysis;
- headway gaps, bunching, and excess wait;
- contributing incident, traffic, weather, fleet, and demand overlays when available.

### What should we change?

- begin with an observed slice or saved investigation;
- test frequency, timetable run time, recovery, capacity, span, stop pattern, or alignment changes;
- compare estimated demand, wait, crowding, journey time, resources, cost, and target attainment;
- show assumptions, uncertainty, and observed-versus-modeled status;
- save the chosen intervention and measure its later outcome.

## Metric catalogue

The catalogue below is deliberately broader than the first implementation. Each metric should exist only where the required source and a defensible definition exist.

| Family | Base facts | Derived measures and questions |
| --- | --- | --- |
| Demand | validations, boardings, alightings, journeys, transfers, OD pairs | totals, growth, peak share, directional imbalance, product/category mix, passenger-km, forecast error |
| Planned supply | trips, stop calls, vehicle-km/hours, capacity, service span | frequency, headway, places, place-km, coverage, peak vehicle requirement, accessible supply |
| Delivered service | observed trips/stop calls/km/hours/capacity | delivery rate, cancellations, partial trips, short turns, missed stops, lost km, extra service, first/last-trip compliance |
| Punctuality | scheduled and observed stop times | early/on-time/late share, start/arrival punctuality, delay percentiles, passenger-weighted punctuality |
| Regularity | scheduled and observed headways | adherence, bunching, gaps, excess waiting time, irregularity index |
| Run time | segment run, dwell, layover, recovery, turnaround | median/P90, variability, slow segments, schedule sufficiency, commercial speed, delay propagation |
| Capacity | vehicle capacity and segment load | occupancy/load factor, maximum load, crowding passenger-minutes/passenger-km, over-capacity segments, left-behind proxy |
| Demand–supply alignment | demand plus planned/delivered capacity | passengers/place-km, demand per trip/km/hour, over/undersupply, growth-capacity mismatch, temporal alignment |
| Passenger impact | demand exposure plus failure/delay | affected passengers, passenger-delay minutes, excess wait/journey time, missed connections, crowding exposure |
| Contracts | target rules plus eligible facts | SLA attainment, breach count/duration/recurrence, weighted failure, bonus/penalty where applicable |
| Productivity and finance | service, passengers, cost, and revenue | passengers/trip/km/hour, cost/km/trip/passenger, revenue, farebox recovery, subsidy/passenger |
| Coverage and access | network geography, service, population, jobs, POIs | people/jobs within service, service span/frequency by area, access-to-opportunity, underserved areas |
| Accessibility and equity | accessible stops/vehicles plus service outcomes | accessible-trip delivery, step-free availability, outcome distribution by geography/priority population |
| Sustainability | energy/fuel, vehicle, km, passengers | energy and emissions per vehicle-km/passenger-km, zero-emission share, dead running, avoided emissions |
| Safety and passenger experience | incidents, complaints, surveys, information feeds | incidents/100k km, complaints/100k boardings, satisfaction, cleanliness, information accuracy, disruption communication |
| Inspections and revenue protection | inspections, passengers, validations, findings | inspection rate, irregularity/fraud rate, estimated revenue leakage, spatial/time concentration |
| Data health | source events, matches, refreshes, corrections | coverage, freshness, trip/stop match rate, imputation share, reconciliation state, correction rate, confidence |

### “Places offered” must be explicit

The phrase can hide materially different measures. Prefer precise names:

- **Capacity per departure:** places assigned to one trip.
- **Places crossing a segment:** sum of vehicle capacity across trips serving a segment and time band.
- **Scheduled place-km:** scheduled vehicle capacity × scheduled distance.
- **Delivered place-km:** capacity of actually delivered service × delivered distance.
- **Places at a stop/time:** capacity on departures available to board, with rules for through-passengers.

Do not add trip capacities across an entire line and label the result simply “places” without specifying the spatial and time grain.

### “Line growth” is a family, not one metric

The line history should show independently:

- demand and passenger-km growth;
- trip, frequency, service-span, and vehicle-km growth;
- place-km and accessibility growth;
- route length, stop count, and geographic coverage change;
- productivity change;
- reliability and passenger-impact change.

Annotate structural changes so growth is not misread across incompatible line or pattern versions.

## Visualization vocabulary

Use consistent visuals for consistent questions:

| Question | Preferred visualization |
| --- | --- |
| What changed over time? | line/control chart with comparable-period and event annotations |
| Which entities explain the change? | ranked Pareto table and contribution waterfall |
| Where is the issue? | map paired with a sortable table |
| When does it recur? | day/date × time heatmap and calendar heatmap |
| What happens along a pattern? | route/stop strip with selectable metric layers |
| Where is delay created? | space-time diagram and segment/stop delay profile |
| Is service regular? | headway distribution and trajectory plot |
| Does demand fit capacity? | load profile, demand-capacity heatmap, growth-capacity quadrant |
| Was the contract target met? | bullet/target chart and breach matrix |
| Are averages hiding poor tails? | histogram, box/violin plot, and percentiles |
| Did an intervention work? | annotated before/after cohort or control chart |

Rules:

- show distributions and percentiles, not only averages;
- pair maps with rankings/tables;
- separate demand and supply axes rather than using confusing dual scales;
- distinguish vehicle-weighted and passenger-weighted results;
- show denominators beside percentages;
- show expected/target bands, not only red/green status;
- preserve the current entity, period, and comparison when changing visualization;
- keep raw evidence one click away.

## Comparisons and baselines

Every KPI needs an explicit answer to “compared with what?” Supported baselines should include:

- same weekday last week;
- rolling equivalent weekdays;
- equivalent period last month/year;
- previous service/timetable version;
- custom Period A versus Period B;
- target/SLA;
- forecast;
- sibling route or pattern;
- peer line cohort by mode/service class;
- operator, contract, and network benchmark.

The backend should select comparable service days using operational calendars, holidays, timetable versions, and known exceptional events. The UI should show that choice and allow an override.

Normalisation should be deliberate: per service day, trip, vehicle-km, vehicle-hour, passenger, place-km, or service area as appropriate. Never average child percentages to produce a parent percentage.

## Multimodal reliability profiles

A common outcome vocabulary should sit above mode/service-specific definitions.

### Timetable-based, lower-frequency service

Primary measures:

- departure/arrival punctuality;
- early running;
- trip completion;
- first/last trip;
- missed connections;
- run-time reliability.

### High-frequency service

Primary measures:

- headway regularity;
- gaps and bunching;
- excess waiting time;
- crowding caused by uneven spacing;
- delivered frequency.

### Rail/metro

Potential extensions:

- service regularity and cancellations;
- station/platform dwell;
- capacity and crowding by train/carriage where available;
- connection and disruption recovery;
- infrastructure-related delay attribution.

### Ferry

Potential extensions:

- terminal departure/arrival and turnaround;
- sailing completion;
- vessel capacity/load;
- connection performance;
- weather-related disruption.

### Demand-responsive service

Potential extensions:

- request fulfilment and denials;
- pickup punctuality and wait;
- ride-time deviation/directness;
- shared occupancy;
- service availability and geographic equity;
- cost and passengers per vehicle-hour.

Do not force every mode into bus-style on-time performance. A line/service class should declare the reliability profile and threshold set it uses.

## Metric contract

Every canonical metric needs a machine-readable and user-visible contract:

```text
id and version
name and plain-language question
definition and exclusions
source facts
numerator and denominator
unit and better-direction
supported modes and reliability profiles
entity and time grains
supported dimensions
aggregation rule
weighting rule
target source and effective dates
default comparison method
freshness and reconciliation policy
coverage and minimum sample
observed / inferred / modeled status
confidence method
privacy/suppression rule
owner and last review
```

The UI should expose a concise definition drawer from every KPI and chart. This is essential for operator accountability and prevents different teams from debating values that use different rules.

## Exception logic

Do not turn every unusual number into an alert. Before raising an exception, verify:

1. source coverage and freshness are sufficient;
2. the denominator and sample are meaningful;
3. there is a target breach, statistically meaningful change, persistent drift, or material forecast miss;
4. the issue persists or has significant passenger/contract impact;
5. related child signals can be clustered into one operational issue.

Priority should keep separate, visible axes for:

- contractual severity;
- passenger exposure;
- gap magnitude;
- duration and recurrence;
- contribution to network/operator result;
- urgency and controllability;
- confidence.

Seven failed trips on one pattern should usually form one clustered exception with seven evidence items, not seven alerts.

Suggested lifecycle:

```text
detected
  → acknowledged
  → investigating
  → action assigned
  → recovering
  → verification period
  → closed or reopened
```

## Distinctive opportunities for GO

These would make the product more valuable than a conventional BI dashboard:

### Passenger-impact layer

Translate operational failures into affected passengers, passenger-delay minutes, excess wait, crowding exposure, and missed connections. Keep the estimation method and confidence visible.

### Change registry

Annotate performance with timetable, route, stop, operator, fleet, contract, roadwork, incident, and policy changes. This turns trends into explainable institutional memory.

### From observation to action to result

Save an investigation slice, record an intervention and expected effect, then automatically compare the verification period. Performance becomes a continuous-improvement loop rather than a monthly report.

### Positive-exception learning

Identify sustained improvements, not only failures. Record which timetable, dispatching, infrastructure, or fleet change coincided with the improvement and where it may transfer.

### Multimodal connection fragility

Show transfers that are repeatedly missed or have insufficient reliability margin across bus, rail, metro, ferry, and demand-responsive services.

### Reliability budget

Show how much run-time or headway variability a service can absorb before connections, terminal recovery, or capacity fails.

### Passenger-equivalent comparison

Offer both operational and passenger-weighted rankings. A small breach on a busy line and a severe breach on a low-volume statutory service should remain visibly different rather than collapsing into one score.

### Evidence-linked narratives

Generate daily/weekly summaries from deterministic findings and link every sentence to the underlying chart, cohort, definition, and trips. Natural-language generation can come later; the evidence model comes first.

## Delivery roadmap

Build vertical slices that answer complete questions rather than adding isolated metrics.

### Phase 0 — semantic foundation

- confirm authority/agency/operator/contract terminology;
- define the effective-dated entity graph and mode/service profiles;
- establish the metric contract and catalogue;
- standardise operational date, comparison, coverage, freshness, and definition version;
- keep base facts additive and derive ratios/averages at query time;
- make filter state shareable in URLs.

### Phase 1 — Line 360 using current foundations

First complete user journey:

```text
Network / line search
  → line overview
  → demand and growth
  → planned versus delivered trips and vehicle-km
  → early/late starts and completion
  → pattern comparison
  → source trips where available
```

Deliver:

- Pulse with a small, honest KPI set;
- searchable line directory;
- line overview, Demand, Delivery, Reliability, and Data Quality lenses;
- consistent comparison and definition drawers;
- current Demand By retained as Explorer;
- no inferred occupancy until a defensible load source exists.

This phase proves the new product structure using facts already present or close to present.

### Phase 2 — Pattern and stop reliability

- canonical stop-call/service-execution fact;
- pattern stop profile;
- stop-level punctuality/headway;
- run time, dwell, speed, and delay propagation;
- space-time diagram and trip evidence;
- missed stops, partial trips, and route adherence;
- high-frequency reliability profile.

### Phase 3 — Capacity and passenger impact

- effective-dated vehicle capacity and actual assignment;
- scheduled/delivered place-km;
- APC or defensible alighting/load inference;
- crowding exposure and demand–capacity mismatch;
- passenger-delay/excess-wait impact;
- origin-destination and transfer views with confidence.

### Phase 4 — Authority and operator management

- operator/contract dossiers;
- target and threshold registry;
- ranked, clustered exceptions;
- saved investigations and evidence packs;
- annotations, commitments, owners, and verification;
- daily, weekly, and monthly reviews.

### Phase 5 — Planning feedback loop

- demand forecast and scenario comparison;
- timetable/frequency/recovery/capacity changes;
- resource, cost, access, reliability, and passenger-impact estimates;
- observed-versus-modeled distinction;
- intervention outcome and reusable learning.

## Product principles and guardrails

- Do not build one dashboard per metric.
- Do not use a synthetic score when the component outcomes tell a clearer story.
- Do not label accepted validations as passengers, journeys, occupancy, or distinct users.
- Do not show occupancy without alighting/load logic and capacity provenance.
- Do not compare periods silently across materially different service versions.
- Do not average percentages or percentiles across entities.
- Do not use punctuality as the primary reliability measure for every service.
- Do not imply causality from correlation; say “contributor” until validated.
- Do not hide data completeness, freshness, inference, or reconciliation state.
- Do not let live/provisional values silently become contractual evidence.
- Prefer a few deep investigation flows over a large grid of shallow cards.

## Decisions to resolve next

1. Which exact product was meant by “Mosaic”?
2. In GO's canonical language, what are the distinct meanings of authority, agency, operator, brand/network, and contract?
3. Which modes and service classes must Phase 1 support, even if Carris Metropolitana supplies the first data?
4. Which contract targets and early/late thresholds are authoritative and effective-dated?
5. What vehicle capacity and assignment data is trustworthy enough for places/place-km?
6. Which stop-call observations and matching rules are reliable enough for stop-level punctuality?
7. Is the first primary user a TML analyst, planner, contract manager, operator, or shared review meeting?
8. Which comparison is the default: previous week, comparable-day cohort, previous year, target, or forecast?
9. Which values may be live/provisional, and which must be reconciled/official before operator use?

The most useful next product artifact is a low-fidelity prototype of Phase 1 covering Pulse → Line 360 → Pattern detail. It should be tested against three real tasks: explaining a demand change, proving a service-delivery failure, and locating where reliability degrades along a pattern.
