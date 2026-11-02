package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyEmailValid(t *testing.T) {
	validationutils.CheckFormat(t, "agency_email", "support@example.com", "invalid", false, standard.AgencyEmailValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_email_valid": config}
	})
}
