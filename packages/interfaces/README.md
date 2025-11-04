## @tmlmobilidade/interfaces

This package provides SDK-style connectors for interacting with databases (e.g., stops, plans, rides, alerts) and external providers (e.g., authentication, storage).
It simplifies data access and integration across projects.

### Purpose
- Unified interface for accessing databases and external services
- Reduces boilerplate by handling common queries and operations
- Ensures consistency across different modules

### Installation
```
npm install @tmlmobilidade/interfaces
```

### Local development

Each interface has a given fixed port number to connect to the corresponding database instance. Use these

| Interface Name | Port  | Env Value                           |
|----------------|:-----:|-------------------------------------|
| auth           | 37000 | mongodb://root:root@localhost:37000 |
| files          | 37001 | mongodb://root:root@localhost:37001 |
| stops          | 37002 | mongodb://root:root@localhost:37002 |
| agencies       | 37003 | mongodb://root:root@localhost:37003 |
| plans          | 37004 | mongodb://root:root@localhost:37004 |
| alerts         | 37005 | mongodb://root:root@localhost:37005 |
| rides          | 37006 | mongodb://root:root@localhost:37006 |
| vehicle_events | 37007 | mongodb://root:root@localhost:37007 |
| hashed_shapes  | 37008 | mongodb://root:root@localhost:37008 |
| hashed_trips   | 37009 | mongodb://root:root@localhost:37009 |
| apex_t11       | 37010 | mongodb://root:root@localhost:37010 |
| apex_t19       | 37011 | mongodb://root:root@localhost:37011 |
| locations      | 37012 | mongodb://root:root@localhost:37012 |