import { evalInLocal } from "./sandbox";

// 数据结构表达式： 前面部分表示数组key名，后面{{#each }}包裹部分表示数组取值来源，如'articles {{#each myArticles}}'
const arrayKeyRegex = /\{\{\s*#each(.*)\}\}/;
export const parseTemplate = (
  template: Record<string, any>,
  /* 模板解析的上下文 */
  data: Record<string, any> | any[],
  /* 可选：每项执行上下文 */
  scope: Record<string, any> = {},
): Record<string, any> | any[] => {
  if (Array.isArray(data)) {
    return data.map((dataItem) => parseTemplate(template, dataItem, scope));
  }
  let result: Record<string, any> | any[] = {};
  Object.keys(template).forEach((key: string) => {
    const value = template[key];
    if (typeof value === 'string') {
      result[key] = parseStringTemplate(value.trim(), { ...data, ...scope });
    } else if (arrayKeyRegex.test(key)) {
      const [_word, matched] = key.match(arrayKeyRegex)!;
      const dataPath = matched.trim();
      const partialData = dataPath !== '.' ? data[dataPath] : data;
      const resultPartialData = partialData.map((item: Record<string, any>) => parseTemplate(value, item, scope));
      const pureKey = key.replace(arrayKeyRegex, '').trim();
      if (pureKey === '.') {
        result = resultPartialData;
      } else {
        result[pureKey] = resultPartialData;
      }
    } else if (typeof value === 'number' || value === null) {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => parseTemplate(item, data, scope));
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      result[key] = parseTemplate(value, data, scope);
    }
  });
  return result;
};

export const parseStringTemplate = (str: string, context: Record<string, any> | any[]) => {
  let match;
  const isFullInterpolation = /^{{[\s\S]+}}$/.test(str.trim()) && (str.match(/{{/g) || []).length === 1;

  // 逐项提取{{}}中表达式
  while ((match = /{{([\s\S]*?)}}/g.exec(str))) {
    const expression = match[1].trim();
    if (expression === '.') {
      return { ...context };
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

const evaluateExpression = (expression: string, context: Record<string, any>) => {
  let value = evalInLocal(expression, context);

  if (typeof value === 'object' && value.isFunctionWrapper) {
    value = value.fn;
  }

  return value;
};
