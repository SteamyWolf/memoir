export class Column {
    constructor(
        public heroImage: string,
        public content?: Content[]
    ) {}
}

export class Content {
    constructor(
        public image: string,
        public text: string
    ) {}
}