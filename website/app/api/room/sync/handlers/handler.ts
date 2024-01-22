export default abstract class {
    name: string;

    constructor(name: string) { this.name = name }

    abstract handle(state: any, queue: any): void;
}