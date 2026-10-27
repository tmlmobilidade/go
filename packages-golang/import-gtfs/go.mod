module github.com/tmlmobilidade/go/packages-golang/import-gtfs

go 1.26.0

require github.com/tmlmobilidade/go/packages-golang/sqlite v0.0.0
require github.com/mattn/go-sqlite3 v1.14.48 // indirect

replace github.com/tmlmobilidade/go/packages-golang/sqlite => ../sqlite
