import handler from "../../handler";

export default class extends handler {
    constructor() { super(["room.start"]) }

    handle(data: any, state: any, queue: any) {
        //console.log(queue);
        //console.log(state);

        const events: any[] = [];


        for (const event of queue) {
            switch (event.target) {
                case "room.start":
                    state.state.screen = event.game;
                    console.log(event.game)
                    switch (event.game) {
                        case "box_demo":
                            state.state.box_game = {
                                players: state.players.map((player: any) => {
                                    return {
                                        session_id: player.session_id,
                                        username: player.username,
                                        x: 0,
                                        y: 0
                                    }
                                }),
                            }
                            console.log(state.state)
                            break;
                    }
                    break;
            }
        }

        return events;
    }
}