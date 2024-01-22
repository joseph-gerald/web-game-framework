export default abstract class {
    name: string;

    constructor(name: string) { this.name = name }

    abstract handle(data: any, state: any, queue: any): void;
}