export class HelloWorldComponent {
    message: string;

    constructor() {
        this.message = 'Hello, World!';
    }

    getMessage(): string {
        return this.message;
    }
}