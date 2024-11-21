<template>
  <el-popover width="300"
              ref="popover">
    <slot name="reference"
          slot="reference"></slot>
    <div>
      <div class="el-color-dropdown__main-wrapper">
        <hue-slider ref="hue"
                    :color="color"
                    vertical
                    style="float: right;"></hue-slider>
        <sv-panel ref="sl"
                  :color="color"></sv-panel>
      </div>
      <alpha-slider v-if="showAlpha"
                    ref="alpha"
                    :color="color"></alpha-slider>
      <predefine v-if="predefine"
                 :color="color"
                 :colors="predefine"></predefine>
      <div class="el-color-dropdown__btns">
        <span class="el-color-dropdown__value">
          <el-input v-model="customInput"
                    @keyup.native.enter="handleConfirm"
                    @blur="handleConfirm"
                    :validate-event="false"
                    size="mini">
          </el-input>
        </span>
        <el-button type="primary"
                   size="mini"
                   class="el-color-dropdown__btn"
                   @click="confirmValue">
          {{ t('el.colorpicker.confirm') }}
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script>
import SvPanel from 'element-ui/packages/color-picker/src/components/sv-panel';
import HueSlider from 'element-ui/packages/color-picker/src/components/hue-slider';
import AlphaSlider from 'element-ui/packages/color-picker/src/components/alpha-slider';
import Predefine from 'element-ui/packages/color-picker/src/components/predefine';
import Locale from 'element-ui/src/mixins/locale';
import ElInput from 'element-ui/packages/input';
import ElButton from 'element-ui/packages/button';
import Color from 'element-ui/packages/color-picker/src/color';

export default {
  name: 'el-color-picker-dropdown',

  mixins: [Locale],

  components: {
    SvPanel,
    HueSlider,
    AlphaSlider,
    ElInput,
    ElButton,
    Predefine
  },

  props: {
    showAlpha: Boolean,
    predefine: Array,
    value: String,
    showAlpha: Boolean,
    colorFormat: String,
  },

  data () {
    const color = new Color({
      enableAlpha: this.showAlpha,
      format: this.colorFormat
    })

    return {
      color,
      showPanelColor: false,
      customInput: ''
    };
  },

  computed: {
    currentColor () {
      const parent = this.$parent;
      return !this.value && !this.showPanelColor ? '' : this.color.value;
    }
  },

  methods: {
    confirmValue () {
      this.$emit('input', this.currentColor)
      this.$emit('change', this.currentColor)
      this.$refs.popover.doToggle()

    },

    handleConfirm () {
      this.color.fromString(this.customInput)
    }
  },

  watch: {
    showPopper (val) {
      if (val === true) {
        this.$nextTick(() => {
          const { sl, hue, alpha } = this.$refs;
          sl && sl.update();
          hue && hue.update();
          alpha && alpha.update();
        });
      }
    },


    currentColor: {
      immediate: true,
      handler (val) {
        this.customInput = val;
      }
    },

    value (val) {
      if (!val) {
        this.showPanelColor = false;
      } else if (val && val !== this.color.value) {
        this.color.fromString(val);
      }
    },
    color: {
      deep: true,
      handler () {
        this.showPanelColor = true;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.el-color-dropdown__main-wrapper {
  width: 300px;
}
</style>
