import Parse from 'parse'
import _ from 'lodash'


export default {
  create (name) {
    var model = Parse.Object.extend(name)

    return {
      $parse: model,
      save (source) {
        const insertModel = new model()

        _.each(source, (value, key) => insertModel.set(key, value))
        return insertModel.save()
      },
      update (src, changes) {
        if (!src) {
          return this.save(changes)
        }

        _.each(changes, (value, key) => src.set(key, value))
        return src.save()
      }
    }
  },

}