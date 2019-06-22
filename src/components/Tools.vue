<template>
  <el-row>
    <el-col :span="10">
      <div style="text-align:right">
        <el-button @click="handleConvert">Convert!</el-button>
      </div>
      <el-input type="textarea"
                :rows="10"
                v-model="urls">
      </el-input>
    </el-col>
    <el-col :span="14">
      <div>{{svgPaths}}</div>
    </el-col>
  </el-row>
</template>
<script>
import parse from 'parse-svg-path'
import extract from 'extract-svg-path/transform'
import load from 'load-svg'
import { parseString } from 'xml2js'
import pathify from 'svg-flatten'


export default {
  data () {
    return {
      urls: 'https://www.draw.io/stencils/mockup/misc.xml',
      svgPaths: ''
    }
  },
  methods: {
    handleConvert () {
      _.each(this.urls.split('/r/n'), (url) => {
        this.$axios.get(url)
          .then(({ data: xml }) => {
            //console.log(parse(xml))
            let wrapper = pathify(xml)
            console.log(wrapper.pathify())
            /*
            let xmlJson = parseString(xml, (err, result) => {
              if (err) {
                throw err;
                return
              }
              console.log(result)
            })*/

          })
      });
    }
  }
}
</script>

