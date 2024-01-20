const sandbox = (code: string) => {
  // 如果code中有自身的return，且不是函数(目前正则就支持校验箭头函数)，说明是函数体语句，就不需要补充return
  const bodyCode = /\breturn\b/.test(code) && !/(.*)\s*=>\s*{.*}/g.test(code) ? code : `return ${code}`;
  const withStr = `with(this) { try { ${bodyCode} } catch(e) {} }`;
  // eslint-disable-next-line no-new-func
  const fun = new Function(withStr);
  return (obj: Record<string, any>) => {
    const proxy = new Proxy(obj, { has: handle });
    // return JSON.parse(JSON.stringify(fun(proxy)));
    return fun.call(proxy);
  };
};

const handle = (target: Record<string, any>, key: string) => {
  // eslint-disable-next-line no-prototype-builtins
  if (target.hasOwnProperty(key)) {
    // 确实存在于局部上下文，返回存在
    return true;
  }
  // 即使不在局部上下文，也返回存在。不继续跟原型行链查找，放弃使用Math等全部方法(这点跟vue模板不同)
  return true;
  // throw new Error('未声明的变量');
};

const evalInLocal = (scr: string, local: object): any => {
  const env = { $ctx: {}, ...local };

  const value = sandbox(scr)(env);
  return value;
};

export {
  evalInLocal,
};
