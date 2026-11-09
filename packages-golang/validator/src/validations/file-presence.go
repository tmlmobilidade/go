package validations

import (
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

// TablesFilePresence adds a control gate for each supported GTFS table.
// The callback resolves its own table from the configured rule ID.
func TablesFilePresence(checks validationTypes.RuleChecks) {
	for _, table := range variables.GtfsRuleFiles {
		checks[table+"_file_missing"] = standard.FileMissing
	}
}
