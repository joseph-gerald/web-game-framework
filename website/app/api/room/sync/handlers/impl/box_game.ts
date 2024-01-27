import handler from "../handler";

export default class extends handler {
    constructor() { super(["demo.box.move"]) }

    handle(data: any, state: any, queue: any) {
        //console.log(queue);
        //console.log(state);

        const events: any[] = [];


        for (const event of queue) {
            switch (event.target) {
                case "demo.box.move":
                    break;
            }
        }

        return events;
    }
}