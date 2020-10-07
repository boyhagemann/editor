
const context = new AudioContext();


Promise.all([
    context.audioWorklet.addModule('./worklets/test.js')
]).then(() => {

    let node = new AudioWorkletNode(context, 'test-processor');

    node.port.onmessage = (event) => {
        // Handling data from the processor.
        console.log(event.data);
    };

    node.port.postMessage('Hello!');

}).catch(error => {
    console.error("ERROR LOADING AUDIO WORKLET", error)
});


export default context