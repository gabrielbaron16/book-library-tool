export class ReservationDTO {
    constructor(
        public userEmail: string,
        public bookId: string,
        public bookCount: number,
        public returnDate: Date,
        public reservationDate?: Date,
        public isReturned?: boolean,
        public isBought?: boolean,
        public id?: string,
        public realReturnDate?: Date
    ) {}
}