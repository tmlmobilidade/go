package validators

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/validators"
)

func ValidateLicensePlate(licensePlate string) bool {
	licensePlate = utils.NormalizeLicensePlate(licensePlate)

	if len(licensePlate) != 6 {
		return false
	}

	return variables.PlateRegex.MatchString(licensePlate)
}
