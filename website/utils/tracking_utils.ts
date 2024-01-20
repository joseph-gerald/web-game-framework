import * as jose from 'jose'

const emojis = Array.from("😷🤒🤕🤢🤮🤧😢😭😨🤯🥵🥶🤑😴🥰🤣🤡💀👽👾🤖👶💋❤️💔💙💚💛🧡💜🖤💤💢💣💥💦💨💫👓💍💎👑🎓🧢💄💍💎🐵🦒🐘🐀🍆🍑🍒🍓⚽🎯🔊🔇🔋🔌💻💰💯");

function getEmojiIndex(string: string) {
    const index = string.split("").map(x => x.charCodeAt(0)).reduce((a, b) => a + b);
    return index % emojis.length;
}

async function sha1(str: string): Promise<string> {
    const data = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("sha-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = btoa(String.fromCharCode(...hashArray)).replaceAll("=", "");
    return hashHex;
}

async function handle(hash: string, data: string, useragent: string) {
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

    const emoji = emojis[getEmojiIndex(computed_hash)];

    return { hash, data_object, passed, emoji }
}

function isNotJSON(req: Request) {
    return typeof req.body !== 'object' || req.headers.get('content-type') != "application/json";
}

async function readJWT(token: string) {
    try {
        const { payload } = await jose.compactVerify(token, Buffer.from(process.env.SECRET_KEY as string));
        return JSON.parse(new TextDecoder().decode(payload))
    } catch (error) {
        return false;
    }
}

export default { handle, isNotJSON, readJWT };