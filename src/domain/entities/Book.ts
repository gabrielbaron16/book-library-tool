export class Book {
    constructor(
        public bookId: string,
        public title: string,
        public author: string,
        public publicationYear: number,
        public publisher: string,
        public price: number,
        public stock: number
    ) {}
}