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

function isObject(object: any) {
    return object != null && typeof object === 'object';
}

function computeDifference(set1: any, set2: any, prefix = "") {
    let diff: any = {
        
    }
    
    for (const [key, value] of Object.entries(set2)) {
        if (set1[key] == undefined) {
            if (isObject(value)) {
                diff[prefix + key] = value;
            } else {
                diff[prefix + key] = value
            }
        }
    }
        
    for (const [key, value1] of Object.entries(set1)) {
        const value2 = set2[key];
        if (value1 === value2) {
            
        } else {
            if (isObject(value1) && isObject(value2)) {
                diff = {
                    ...diff,
                    ...computeDifference(value1, value2, prefix + key + ".")
                }
            } else {
                diff[prefix + key] = value2
            }
        }
    }
    
    return diff;
}

export default {
    DEBUG, servers,
    splitWithTail,
    computeDifference
};