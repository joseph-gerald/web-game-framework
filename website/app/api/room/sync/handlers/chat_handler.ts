import handler from "./handler";

export default class extends handler {
    constructor() { super("chat") }

    handle(data: any, state: any, queue: any) {
        //console.log(queue);
        //console.log(state);

        const events: any[] = [];

        for (const event of queue) {
            events.push({
                type: "chat",
                visibility: "public",
                data: {
                    message: event.data.message,
                    sender: data.token.username,
                    timestamp: event.data.timestamp
                }
            });
        }

        return events;
    }
}