import { h, ref } from '../../lib/guide-mini-vue-esm.js'

import ArrayToText from "./ArrayToText.js"
import TextToText from "./TextToText.js"
import TextToArray from "./TextToArray.js"
import ArrayToArray from "./ArrayToArray.js"

export const App = {
    name: 'App',
    setup () {
        return {}
    },
    render () {
        return h('div', { tId: 1 }, [
            h('p', {}, '主页'),
            // 老 array 新 text
            // h(ArrayToText)
            // 老 text 新 text
            // h(TextToText)
            // 老 text 新 array
            // h(TextToArray)
            // 老 array 新 array
            h(ArrayToArray)
        ])
    }
}
