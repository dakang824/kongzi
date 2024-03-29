import { link } from '../mixins/link';
import { VantComponent } from '../common/component';
VantComponent({
  classes: ['title-class', 'label-class', 'value-class', 'right-icon-class', 'hover-class'],
  mixins: [link],
  props: {
    title: null,
    courseName:null,
    samllTip:null,
    value: null,
    color:null,
    icon: String,
    src: String,
    size: String,
    label: String,
    center: Boolean,
    isLink: Boolean,
    required: Boolean,
    clickable: Boolean,
    titleWidth: String,
    customStyle: String,
    arrowDirection: String,
    border: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    onClick: function onClick(event) {
      this.$emit('click', event.detail);
      this.jumpLink();
    }
  }
});