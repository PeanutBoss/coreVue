import { reactive } from '../reactive'
// import { nextTick } from '../src/'
function nextTick (fn?) {}

function watchEffect(fn) {

}

describe('api: watch', () => {

    it('effect', async () => {
        const state = reactive({ count: 0 })
        let dummy
        watchEffect(() => {
            dummy = state.count
        })
        expect(dummy).toBe(0)
    })

})
