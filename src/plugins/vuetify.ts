// Vuetify
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import theme from './vuetify.theme'

// Styles
import '@mdi/font/css/materialdesignicons.css'
// Import the base CSS
import 'vuetify/dist/vuetify.min.css'

export default createVuetify({
  blueprint: md3,
  theme,
  defaults: {
    VBtn: {
      variant: 'elevated',
      rounded: true,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VCard: {
      elevation: 2,
    },
  },
})
