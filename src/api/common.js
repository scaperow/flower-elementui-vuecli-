import Parse from 'parse';
import _ from 'lodash';

const { VUE_APP_PARSE_ID, VUE_APP_PARSE_URL, VUE_APP_PARSE_KEY } = process.env;
Parse.initialize(VUE_APP_PARSE_ID, VUE_APP_PARSE_KEY);
Parse.serverURL = VUE_APP_PARSE_URL;

export default {
  create (name) {
    var model = Parse.Object.extend(name);

    return {
      $parse: model,
      save (source) {
        const insertModel = new model();

        _.each(source, (value, key) => insertModel.set(key, value));

        return insertModel.save();
      },
      search () {

      }
    }
  },

}