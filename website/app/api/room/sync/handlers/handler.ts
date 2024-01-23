import crypto_utils from "@/utils/crypto_utils";

export default abstract class {
    name: string;

    constructor(name: string) { this.name = name }

    abstract handle(data: any, state: any, queue: any): void;

    createEvent(type: string, visibility: string, data: any) {
        const date = Date.now();
        return {
            type: type,
            visibility: visibility,
            timestamp: date,
            hash: crypto_utils.sha1(JSON.stringify(data) + type + visibility + date).substring(0, 6),
            data: data
        }
    }
}