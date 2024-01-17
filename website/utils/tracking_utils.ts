import { NextApiRequest, NextApiResponse } from "next";
import tracking_utils from "./tracking_utils";

async function sha1(str: string): Promise<string> {
    const data = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("sha-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = btoa(String.fromCharCode(...hashArray)).replaceAll("=", "");
    return hashHex;
}

async function process(hash: string, data: string, useragent: string) {
    const parsed_data = atob(String.fromCharCode(...atob(data).split(",").map(x => parseInt(x)))).split("||")
    const fields = ["AUDIO_FINGERPRINT", "CANVAS_FINGERPRINT", "CANVAS_DATA", "USERAGENT", "TIMEZONE_OFFSET", "PLUGINS", "MIME_TYPES", "ENCODING_FINGERPRINT", "LANGUAGES", "LANGUAGE", "WEBDRIVER", "PLATFORM", "BROWSER", "WEBGL_VENDOR", "WEBGL_RENDERER", "BATTERY_FINGERPRINT", "DISPLAY_FINGERPRINT", "SCRIPT","SCRIPT_1", "DO_NOT_TRACK", "COOKIES_ENABLED"]
    const data_object: any = {};
    const tracking_data = [];
    let index = 0;

    for (const field of fields) {
        if (index < 15) tracking_data.push(parsed_data[index])
        data_object[field] = parsed_data[index++]
    }

    data_object.SCRIPT += "||"+data_object.SCRIPT_1;
    delete data_object.SCRIPT_1;

    // See if the hash matches the data (tampered data or hash)
    const computed_hash = await sha1("SaltySaltChip"+btoa(tracking_data.join("||")));
    const integrity = computed_hash == hash;

    // See if the useragent is the same
    const sameUseragent = useragent == data_object.USERAGENT; 

    // Verdict from both checks
    const passed = integrity && sameUseragent;

    return { hash, data_object, passed }
}

function isNotJSON(req: NextApiRequest) {
    return typeof req.body !== 'object' || req.headers['content-type'] != "application/json";
}

export default { process, isNotJSON };