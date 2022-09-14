namespace STATE {
    function test (string) {

        let i, startIndex, endIndex
        let result: any[] = []

        function waitForA (char) {
            if (char === 'a') {
                startIndex = i
                return waitForB
            }
            return waitForA
        }
        function waitForB (char) {
            if (char === 'b') {
                return waitForC
            }
            return waitForA
        }
        function waitForC (char) {
            if (char === 'c') {
                endIndex = i
                return end
            }
            return waitForA
        }
        function end () {
            return end
        }

        let currentState = waitForA
        for (let i = 0; i < string.length; i++) {
            let nextState = currentState(string[i])
            currentState = nextState

            if (currentState === end) {
                console.log(startIndex, endIndex)
                currentState = waitForA
                result.push({
                    start: startIndex,
                    end: endIndex
                })
                // return true
            }
        }
        // return false
    }


    console.log(test('abc'))
}

