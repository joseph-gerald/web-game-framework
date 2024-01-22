import handler from "./handler";

export default class extends handler {
    constructor() { super("chat") }

    handle(state: any, queue: any) {
        console.log(1, state);
    }
}