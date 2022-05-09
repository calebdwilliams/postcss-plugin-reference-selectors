const exportsString = '._export💲';
const postcssPlugin = 'postcss-reference-selectors';

const includeAtSelector = 'include';

const ruleMap = new Map();
let root;
module.exports = () => {
  return {
    postcssPlugin,
    Once(_root) {
      root = _root;
    },
    AtRule: {
      [includeAtSelector]: atRule => {
        const { params, parent } = atRule;
        const replacementRule = ruleMap.get(params).clone();
        if (!replacementRule || parent === root) {
          throw new Error('Reference selectors can not be applied to root');
        }
        replacementRule.walk((decl) => {
          parent.insertBefore(atRule, decl);
        });
        atRule.remove();
      },
      import: () => {
        // TODO figure out imports
      }
    },
    Rule(rule) {
      if (rule.selector.match(/^\$/)) {
        const { selector } = rule;
        if (rule.parent !== root) {
          throw new Error('Reference selector definitions must be a child of root');
        }
        if (ruleMap.has(selector)) {
          throw new Error(`${selector} cannot be defined twice in the same root`);
        }
        ruleMap.set(rule.selector, rule.clone());
        rule.selector = selector.replace('$', exportsString);
      }
    }
  }
};

module.exports.postcss = true;

// module.exports = postcss.plugin('postcss-references', (options = {}) => {
//   console.info(options);
//   // Work with options here
//   return (root) => {
//     // console.log(root)

//     for (const [key, rule] of ruleMap.entries()) {
//       const { selector } = rule;
//       if (selector.includes(',')) {
//         continue;
//       }
//       // console.log(toSassMixin(rule))
//       const safeKey = key.replace('$', exportsString);
//       rule.selector = safeKey;
//       root.append(rule);
//     }
//   };
// });
module.exports.toSassMixin = (rule) => {
  const mixin = rule.clone();
  mixin.selector = `@mixin ${rule.selector.replace('$', '')}`;
  return mixin;
};
