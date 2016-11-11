// import * as babylon from "babylon";
// import * as t from "babel-types";
// import traverse from "babel-traverse";
// import fs from 'fs';
// import generate from 'babel-generator';
//
// const code = fs.readFileSync('./test.js').toString();
// const ast = babylon.parse(code);
//
// traverse(ast, {
//   enter({ node }) {
//     if (t.isTaggedTemplateExpression(node)) {
//         if (node.tag.name !== 'gt') {
//           return;
//         }
//         const str = generate(node.quasi);
//         console.log(str.code);
//     }
//   }
// });
    
function extractFromFile() {

}

export function extractFromFiles(filepaths, options) {
}
