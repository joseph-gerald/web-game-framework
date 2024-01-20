import { MongoClient } from 'mongodb';

const DEBUG = !!process.env.DEBUG;
const servers = [];

type Server = {
    id: string;
    name: string;
    description: string;
    uri: string;
}

for (let i = 0; i < (parseInt(process.env.GAME_SERVER_COUNT as string)); i++) {
    const id = "GS_" + i;
    const server_data = splitWithTail(process.env[id] as string, ":", 2);

    if (!server_data?.length || server_data?.length < 3) break;

    const server: Server = {
        id,
        name: server_data[0],
        description: server_data[1],
        uri: server_data[2],
    }

    servers.push(server);
}

function splitWithTail(str: string, delim: any, count: any) {
    var parts = str.split(delim);
    var tail = parts.slice(count).join(delim);
    var result = parts.slice(0, count);
    result.push(tail);
    return result;
}

export default {
    DEBUG, servers,
    splitWithTail
};