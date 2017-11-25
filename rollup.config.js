import uglify from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript';

var env = process.env.NODE_ENV
var config = {
  format: 'umd',
  moduleName: 'Redux-Undoable',
  plugins: [
    typescript()
  ]
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config
