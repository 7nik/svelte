/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */
import { extract_identifiers } from '../../../utils/ast.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	if (
		(context.state.ast_type !== 'instance' && context.state.ast_type !== 'template') ||
		context.state.function_depth !== 1 ||
		!context.state.analysis.runes
	) {
		context.next();
		return;
	}

	const declarator = context.path.at(-1);
	const declaration = context.path.at(-2);
	const top_level = context.path.at(-3);

	if (
		declarator?.type !== 'VariableDeclarator' ||
		declaration?.type !== 'VariableDeclaration' ||
		declaration.declarations.length !== 1 ||
		(top_level?.type !== 'Program' && top_level?.type !== 'ConstTag')
	) {
		throw new Error('TODO: invalid usage of `await` expression at the top-level of a component');
	}

	for (const id of extract_identifiers(declarator.id)) {
		const binding = context.state.scope.get(id.name);
		if (binding !== null) {
			binding.kind = 'derived';
		}
	}

	context.state.analysis.uses_await = true;

	context.next();
}
