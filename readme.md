### 实现原理
实现了1个双端可用的沙箱，用于解析字符串模版语法，安全高效

### 模板语法
用双花括号{{}}表示是逻辑语法，需要解析
- 计算式: a+1
- 点号: 表示取全部值
- 逻辑语句: 相当于代码执行
- 函数定义: 目前仅支持箭头函数
具体示例，请参照代码中的单元测试

### 示例
```javascript
const data = {
  userName: 'Johan',
  price: 10.99,
  myArticles: [{ label: 'article A' }, { label: 'article B' }],
};
const template = {
  // 变量取值
  name: '{{userName}} buy {{ price }}',
  // 计算式
  price: '{{ price + 1 }}',
  // 数组遍历
  'articles {{#each myArticles}}': {
    title: '{{label}}',
  },
  // 函数体，会解析执行
  odd: '{{ if (myArticles.length > 0) { return 1 } return 0 }}',
  // 多行函数体
  mulLine: '{{ if (myArticles.length > 0) {\n return price * 2;\n } else {\n return price - 1;\n }\n }}',
  // 函数定义，会解析成函数(未执行)
  oddFn: '{{ (arg) => { if (myArticles.length > 0 && arg.x === 1) { return 1 } return 0 } }}',
  // 常量字符串
  word: 'abc xyz',
  // 常量数字
  number: 1,
};
const result: Record<string, any> = parseTemplate(template, data, { x: 1 });
const oddFnResult = result.oddFn({ x: 1 });
expect(result).toEqual({
  name: 'Johan buy 10.99',
  price: 11.99,
  articles: [
    {
      title: 'article A',
    },
    {
      title: 'article B',
    },
  ],
  odd: 1,
  mulLine: 21.98,
  oddFn: result.oddFn,
  word: 'abc xyz',
  number: 1,
});
```
