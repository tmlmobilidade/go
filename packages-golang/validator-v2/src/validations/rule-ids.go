package validations

import (
	"embed"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/discover"
)

// Embed the check sources so discovery also works in standalone binaries.
//
//go:embed */checks/*.go
var checkSources embed.FS

// RuleIDs discovers known rule IDs without running any GTFS checks.
func RuleIDs() ([]string, error) {
	//

	//
	// 1. Discover rule IDs from the embedded validation sources

	return discover.DiscoverRuleIDs(checkSources)
}
