package typescript

import (
	"os"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/discover"
)

// DiscoverRuleIDs uses the same source discovery as rules.json validation.
func DiscoverRuleIDs(sourceDir string) ([]string, error) {
	//

	//
	// 1. Discover IDs from the supplied validation source directory

	return discover.DiscoverRuleIDs(os.DirFS(sourceDir))
}
