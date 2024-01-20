import { parseStringTemplate, parseTemplate } from '../src/index';

describe('测试模板解析功能', () => {
  it('When调用parseTemplate函数，Then解析得到正确结果', () => {
    const data = {
      userName: 'John',
      price: 10.99,
      myArticles: [{ label: 'Article A' }, { label: 'Article B' }],
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
      // 数组转换
      // articles2: {
      //   title2: '{{ myArticles.label }} ',
      // },
    };
    const result: Record<string, any> = parseTemplate(template, data, { x: 1 });
    const oddFnResult = result.oddFn({ x: 1 });
    expect(result).toEqual({
      name: 'John buy 10.99',
      price: 11.99,
      articles: [
        {
          title: 'Article A',
        },
        {
          title: 'Article B',
        },
      ],
      // articles2: [
      //   {
      //     title2: 'Article A',
      //   },
      //   {
      //     title2: 'Article B',
      //   },
      // ],
      odd: 1,
      mulLine: 21.98,
      oddFn: result.oddFn,
      word: 'abc xyz',
      number: 1,
    });
    expect(oddFnResult).toBe(1);
  });

  it('When配置了默认值，调用parseTemplate函数，Then默认值会生效', () => {
    const template = {
      code: '{{code || 0}}',
      message: '{{message || ""}}',
      data: '{{ values }}',
      count: '{{ total }}',
    };
    const data = {
      values: [1, 2, 3],
      total: 3,
    };
    const result = parseTemplate(template, data);
    expect(result).toEqual({
      code: 0,
      message: '',
      data: [1, 2, 3],
      count: 3,
    });
  });
  it('When用数组数据调用parseTemplate，Then会针对数组每项进行解析', () => {
    const template = {
      id: '{{id}}',
      desc: '{{op.desc}}',
      operator: 'zzr',
    };
    const result = parseTemplate(template, [
      {
        id: 1,
        op: { desc: '描述' },
      },
    ]);
    expect(result).toEqual([
      {
        id: 1,
        desc: '描述',
        operator: 'zzr',
      },
    ]);
    const result2 = parseTemplate(template, []);
    expect(result2).toEqual([]);
  });
  it('When解析字符串模板传递了参数，Then同时可以通过scope和参数进行解析', () => {
    const x = parseStringTemplate('{{ return x + y }}', { x: 2, y: 1 });
    expect(x).toBe(3);
  });
  it('When解析字符串模板传递了点号，Then表示解析获取整体数据', () => {
    const x = parseStringTemplate('{{ . }}', { x: 2, y: 1 });
    expect(x).toEqual({ x: 2, y: 1 });
  });
});

