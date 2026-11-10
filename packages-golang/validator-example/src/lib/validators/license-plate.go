package validators

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/validators"
)

func ValidateLicensePlate(licensePlate string) bool {
	//

	//
	// 1. Normalize the license plate

	licensePlate = utils.NormalizeLicensePlate(licensePlate)

	//
	// 2. Check if the license plate is valid

	if len(licensePlate) != 6 {
		return false
	}

	//
	// 3. Return true if the license plate is valid

	return variables.PlateRegex.MatchString(licensePlate)
}
