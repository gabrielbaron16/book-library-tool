export class Reservation {
    constructor(
        public userEmail: string,
        public bookId: string,
        public bookCount: number,
        public returnDate: Date,
        public reservationDate: Date,
        public isReturned: boolean,
        public id?: string,
        public realReturnDate?: Date
    ) {}
}