package agency_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyIdValid(t *testing.T) {
	testutils.CheckOptions(t, "agency_id", "001", checks.AgencyIdValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_id_valid": config}
	})
}
