import validator from 'validator'

const messages = {
  isNotEmpty: '必填',
  isAfter: '时间需要在 $date 之后',
  isAlpha: '只能输入字母',
  isAlphanumeric: '只能输入字母或数字',
  isBefore: '时间需要在 $date 之前',
  isCurrency: '货币格式不正确',
  isDecimal: '只能输入数, 小数点后 $decimal_digits 位',
  isEmail: '邮箱格式不正确',
  isEmpty: '必须为空',
  isIn: (str, values) => '必须在范围 [' + values.map(value => value).join(',') + '] 之内',
  isInt: '不是一个数字',
  isLength: ({ min, max }) => {
    if (max === undefined) {
      return `长度不能小于 ${min}`
    } else {
      if (max === min) {
        return `长度应为 ${min}`
      } else {
        return `长度不能小于 ${min}, 且不能大于 ${max}`
      }
    }
  },
  isLowercase: '请输入小写字母',
  isMobilePhone: '号码格式不正确',
  isNumeric: '数字格式不正确',
  isURL: '地址格式不正确',
  matches: '格式不正确'
}

export default {
  validate (validateName, options, labelName) {
    return (value) => {
      var isPass = false

      switch (validateName) {
        case 'isNotEmpty':
          isPass = !validator.isEmpty(value)
          break;

        default:
          if (validator.hasOwnProperty(validateName)) {
            isPass = validator[validateName](value, options)
          }
          break;
      }

      if (!isPass) {
        var message = messages[validateName]
        if (typeof (message) === 'string') {
          return message
        } else if (typeof (message) === 'function') {
          return message(options, labelName)
        } else {
          return '格式不正确'
        }
      }

      return true
    }

  },
  install (vue) {
    vue.prototype.$validate = this.validate
  }
}