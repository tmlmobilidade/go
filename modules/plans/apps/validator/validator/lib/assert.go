package lib

import "fmt"

type AssertionMessage struct {
	Expected int
	Actual int
	Message string
}

func Assert(assertion AssertionMessage) (string) {
	if assertion.Expected != assertion.Actual {
		return fmt.Sprintf("%s: Expected %d, Actual %d", assertion.Message, assertion.Expected, assertion.Actual)
	}
	
	return ""
}