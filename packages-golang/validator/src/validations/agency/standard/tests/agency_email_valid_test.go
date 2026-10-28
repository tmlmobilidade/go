package agency_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyEmailValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_email", "support@example.com", "invalid", false, checks.AgencyEmailValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_email_valid": config}
	})
}
