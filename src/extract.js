import * as babylon from "babylon";
import * as t from "babel-types";
import traverse from "babel-traverse";
import fs from 'fs';
import generate from 'babel-generator';
    
function extractFromFile(filepath, opts) {
	const code = fs.readFileSync(filepath).toString();
	const ast = babylon.parse(code);

	traverse(ast, {
	  enter({ node }) {
	    if (t.isTaggedTemplateExpression(node)) {
	        if (node.tag.name !== 'gt') {
	          return;
	        }
	        const str = generate(node.quasi);
	        console.log(str.code.replace(/^`|`$/g, ''));
	    }
	  }
	});
}

export function extractFromFiles(filepaths, options) {
	if (! Array.isArray(filepaths)) {
		filepaths = [filepaths];
    }
    filepaths.map((filepath) => extractFromFile(filepath, options))
}
