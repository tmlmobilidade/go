package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyUrlValid(t *testing.T) {
	validationutils.CheckFormat(t, "agency_url", "https://example.com", "invalid", false, standard.AgencyUrlValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_url_valid": config}
	})
}
