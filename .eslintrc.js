module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    // 'consistent-return': 0,//return 后面是否允许省略
    'no-useless-return': "error",
    'quotes': [1, "single"],//引号类型 `` "" ''
    'space-before-function-paren': 0, //方法名后空格
    'semi':0,//语句强制分号结尾
    // keyword 前后需要空格
    'keyword-spacing': [
      2,
      {
        "before": true,
        "after": true,
        "overrides": {}
      }
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
