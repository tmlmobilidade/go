package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestMondayValid(t *testing.T) {
	validationutils.CheckWeekday(t, "monday", standard.MondayValid)
}
