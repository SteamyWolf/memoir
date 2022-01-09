export class Column {
    constructor(
        public heroImage: string,
        public content?: Content[],
        public hasEditBtn?: boolean
    ) {}
}

export class Content {
    constructor(
        public image: string,
        public text: string
    ) {}
}