package utils

import (
	"go/ast"
	"go/token"
	"strconv"
)

// StringLiteral resolves a string literal or a chain of local value declarations.
// Unsupported expressions and cyclic references return an empty string.
func StringLiteral(expression ast.Expr) string {
	//

	//
	// 1. Follow local identifiers without revisiting a declaration

	visited := make(map[*ast.Object]bool)
	for {
		if identifier, ok := expression.(*ast.Ident); ok && identifier.Obj != nil {
			if visited[identifier.Obj] {
				return ""
			}
			visited[identifier.Obj] = true
			if declaration, ok := identifier.Obj.Decl.(*ast.ValueSpec); ok {
				var value ast.Expr
				for i, name := range declaration.Names {
					if name.Name == identifier.Name && i < len(declaration.Values) {
						value = declaration.Values[i]
						break
					}
				}
				if value != nil {
					expression = value
					continue
				}
			}
		}

		//
		// 2. Decode a Go string literal, or ignore an unsupported expression

		if value, ok := expression.(*ast.BasicLit); ok && value.Kind == token.STRING {
			text, err := strconv.Unquote(value.Value)
			if err == nil {
				return text
			}
		}
		return ""
	}
}
