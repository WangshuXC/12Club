// ************* Core ESLint Rules ************
const commonCoreRules = {
  // 注意：indent 规则由 Prettier 处理，这里关闭以避免冲突
  // indent: ['error', 2],
  'object-curly-spacing': ['error', 'always'], // 强制在对象字面量的大括号内使用空格
  eqeqeq: ['error', 'always'], // 要求使用全等（===）和非全等（!==）运算符
  'no-empty': 'error', // 禁止出现空的代码块
  'no-useless-catch': 'error', // 禁止出现不做任何事情的 catch 块
  'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0 }], // 限制连续空行的数量不能超过1
  'max-params': ['error', 5], // 限制函数定义中参数的最大数量为5
  'max-depth': ['error', 4], // 限制代码块嵌套的最大深度为3
  'max-nested-callbacks': ['error', 4], // 限制回调函数嵌套的最大深度为3

  // 注释的换行规则 （以下规则只适用于独立的注释，如果注释位于代码行的末尾，则不会生效）
  'lines-around-comment': [
    'error',
    {
      beforeBlockComment: false, // 在块注释（/* ... */）之前可以不用换行
      afterBlockComment: false, // 在块注释（/* ... */）之后可以不用换行
      beforeLineComment: true, // 在行注释（// ...）之前需要一个空行
      afterLineComment: false, // 在行注释（// ...）之后不需要空行
      allowBlockStart: true, // 在块的开始处允许没有空行
      allowBlockEnd: false, // 在块的结束处不允许没有空行
      allowObjectStart: true, // 在对象的开始处允许没有空行
      allowObjectEnd: false, // 在对象的结束处不允许没有空行
      allowArrayStart: true, // 在数组的开始处允许没有空行
      allowArrayEnd: false // 在数组的结束处不允许没有空行
    }
  ],

  // 代码的换行规则（注意顺序）
  'padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: ['function'], next: 'return' }, // 在大部分return语句之前需要空行

    // 块语句与任何语句间必须换行（包括块语句）
    { blankLine: 'always', prev: '*', next: 'block-like' },
    { blankLine: 'always', prev: 'block-like', next: '*' },

    // 声明语句与其他分声明语句间必须换行 (函数\表达式语句\if\for 除外)
    { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
    {
      blankLine: 'any',
      prev: ['const', 'let', 'var'],
      next: ['const', 'let', 'var', 'function', 'expression', 'if', 'for']
    },

    // import与其他语句间必须换行
    { blankLine: 'always', prev: 'import', next: '*' },
    { blankLine: 'any', prev: 'import', next: 'import' },

    // export与任何语句间必须换行（包括export）
    { blankLine: 'always', prev: '*', next: 'export' },
    { blankLine: 'always', prev: 'export', next: 'export' },

    // CommonJS：require与其他语句间必须换行
    { blankLine: 'always', prev: 'cjs-import', next: '*' },
    { blankLine: 'any', prev: 'cjs-import', next: 'cjs-import' },

    // CommonJS：export与任何语句间必须换行（包括export）
    { blankLine: 'always', prev: '*', next: 'cjs-export' },
    { blankLine: 'always', prev: 'cjs-export', next: 'cjs-export' }
  ],
  'import/order': [
    'error',
    {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
        'object',
        'type'
      ],
      pathGroups: [
        {
          pattern: 'react',
          group: 'external',
          position: 'before'
        }
      ],
      pathGroupsExcludedImportTypes: ['react'],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc'
      }
    }
  ],

  'no-restricted-syntax': [
    'error',
    {
      selector: 'ForInStatement',
      message:
        'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.'
    },
    {
      selector: 'LabeledStatement',
      message:
        'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
    },
    {
      selector: 'WithStatement',
      message:
        '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
    }
  ]
}

module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    ...commonCoreRules,
    '@typescript-eslint/no-explicit-any': 'warn' // 允许使用 any 类型，但会警告
  }
}
