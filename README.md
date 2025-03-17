# Book Library Tool

Book Library Tool is a Node.js application designed to manage book reservations efficiently. It allows users to reserve books, receive reminders for upcoming due dates, and ensures timely returns.

## Features

- **Book Reservations**: Users can reserve available books.
- **Due Date Notifications**: Automated email reminders are sent to users before their book's due date.
- **Return Management**: Seamless process for marking books as returned and updating inventory.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/gabrielbaron16/book-library-tool.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd book-library-tool
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following variables:
    ```plaintext
    MONGODB_URI=your_mongodb_connection_string
    ```
5. **Build the application**:
    ```bash
    npm run build
    ```   

6. **Start the application**:
    ```bash
    npm start
    ```

## Usage

- **Reserve a Book**: Send a `POST` request to `/api/reservations` with the user's email and the book ID.
- **Receive Due Date Reminders**: The system automatically sends email reminders to users a few days before their due date.
- **Return a Book**: Send a `PUT` request to `/api/reservations/:id/return` with the actual return date.

## API Endpoints

The API endpoints documentation is available on Swagger at the `/docs` path.

## Running Tests

To run the unit tests, use the following command:
```bash
npm run test