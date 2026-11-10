package severity

import (
	"strings"
)

// isTechnicalNotice identifies parser and file-level diagnostics that can be emitted
// without an explicit per-row rule configuration.
func isTechnicalNotice(id string) bool {
	//

	//
	// 1. Recognize parser, missing-file, and feed-level diagnostic IDs

	return strings.HasSuffix(id, "_values_parse") || strings.HasSuffix(id, "_file_missing") ||
		id == "file_validation" || id == "file_not_found_in_rules" ||
		id == "file_validation_gtfs_feed_file_presence_and_integrity_rule"
}
