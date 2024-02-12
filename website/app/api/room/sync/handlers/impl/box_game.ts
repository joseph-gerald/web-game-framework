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
                    for (const player of state.state.box_game.players) {
                        if (player.session_id == data.token.session_id) {
                            player.x += event.data.motion[0];
                            player.y -= event.data.motion[1];
                        }
                    }
                    console.log(state.state.box_game.players);
                    break;
            }
        }

        return events;
    }
}