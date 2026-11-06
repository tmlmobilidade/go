package database

import "strings"

// SanitizeName quotes a name for SQLite without changing its name.
func SanitizeName(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}