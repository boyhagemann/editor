
export class MyAudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.port.onmessage = (event) => {
            // Handling data from the node.
            console.log(event.data);

            switch (event.data.type) {

                case "start":
                    console.log("Starting")
                    break;

                case "stop":
                    console.log("Stopping")
                    break;
            }
        };

        this.port.postMessage('Hi!');

    }

    process(inputs, outputs, parameters) {
        /* using the inputs (or not, as needed), write the output
           into each of the outputs */

        return true;
    }
};

registerProcessor("test-processor", MyAudioProcessor);