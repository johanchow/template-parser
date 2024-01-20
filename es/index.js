Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseStringTemplate = exports.parseTemplate = void 0;
const sandbox_1 = require("./sandbox");
// 数据结构表达式： 前面部分表示数组key名，后面{{#each }}包裹部分表示数组取值来源，如'articles {{#each myArticles}}'
const arrayKeyRegex = /\{\{\s*#each(.*)\}\}/;
const parseTemplate = (template, /* 模板解析的上下文 */
data, /* 可选：每项执行上下文 */
scope = {}) => {
  if (Array.isArray(data)) {
    return data.map(dataItem => (0, exports.parseTemplate)(template, dataItem, scope));
  }
  let result = {};
  Object.keys(template).forEach(key => {
    const value = template[key];
    if (typeof value === 'string') {
      result[key] = (0, exports.parseStringTemplate)(value.trim(), {
        ...data,
        ...scope
      });
    } else if (arrayKeyRegex.test(key)) {
      const [_word, matched] = key.match(arrayKeyRegex);
      const dataPath = matched.trim();
      const partialData = dataPath !== '.' ? data[dataPath] : data;
      const resultPartialData = partialData.map(item => (0, exports.parseTemplate)(value, item, scope));
      const pureKey = key.replace(arrayKeyRegex, '').trim();
      if (pureKey === '.') {
        result = resultPartialData;
      } else {
        result[pureKey] = resultPartialData;
      }
    } else if (typeof value === 'number' || value === null) {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => (0, exports.parseTemplate)(item, data, scope));
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      result[key] = (0, exports.parseTemplate)(value, data, scope);
    }
  });
  return result;
};
exports.parseTemplate = parseTemplate;
const parseStringTemplate = (str, context) => {
  let match;
  const isFullInterpolation = /^{{[\s\S]+}}$/.test(str.trim()) && (str.match(/{{/g) || []).length === 1;
  // 逐项提取{{}}中表达式
  while (match = /{{([\s\S]*?)}}/g.exec(str)) {
    const expression = match[1].trim();
    if (expression === '.') {
      return {
        ...context
      };
    }
    let value;
    try {
      value = evaluateExpression(expression, context);
    } catch (error) {
      console.error(`无法识别的模板表达式: "${expression}"`, error);
      value = '';
    }
    if (isFullInterpolation) {
      return value;
    }
    str = str.replace(match[0], value);
  }
  return str;
};
exports.parseStringTemplate = parseStringTemplate;
const evaluateExpression = (expression, context) => {
  let value = (0, sandbox_1.evalInLocal)(expression, context);
  if (typeof value === 'object' && value.isFunctionWrapper) {
    value = value.fn;
  }
  return value;
};
