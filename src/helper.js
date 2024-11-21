import _ from 'lodash'

export default {
  $get (object, keyName) {
    return _.get(object, keyName)
  }
}