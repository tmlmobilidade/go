module github.com/tmlmobilidade/go/packages-golang/gtfs-validator

go 1.26.0

require (
	github.com/tmlmobilidade/go/packages-golang/import-gtfs v0.0.0
	github.com/tmlmobilidade/go/packages-golang/sqlite v0.0.0
)

require (
	github.com/mattn/go-sqlite3 v1.14.48 // indirect
	github.com/tmlmobilidade/go/packages-golang/telemetry v0.0.0 // indirect
)

replace github.com/tmlmobilidade/go/packages-golang/import-gtfs => ../import-gtfs

replace github.com/tmlmobilidade/go/packages-golang/sqlite => ../sqlite

replace github.com/tmlmobilidade/go/packages-golang/telemetry => ../telemetry
