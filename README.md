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
   EMAIL_HOST=your_email_host
   EMAIL_PORT=your_email_port
   EMAIL_SECURE=true_or_false
   EMAIL_FROM=your_email_from_address
    ```
5. **Build the application**:
    ```bash
    npm run build
    ```

6. **Start the application**:
    ```bash
    npm start
    ```

## Docker Setup

This project includes a `docker-compose` file to set up the necessary containers for the email service and MongoDB.

### Services

- **mailhog**: A local email testing service that captures outgoing emails, allowing developers to inspect and debug emails without sending them to real recipients.
- **mongo**: MongoDB database used to store reservation data.

### Starting the Containers

To start the containers, run the following command in the project directory:

   ```bash
    docker-compose up
   ```

## Business Rules
- **Book Delete**: Can't remove book reference if this has active reservations.
- **Insufficient Balance**: Can't create a new reservation if the user has lower balance than the reservation cost.
- **Out of Stock**: Can't create a new reservation for a book which is unavailable.

## API Endpoints

The API endpoints documentation is available on Swagger at the `/docs` path.

## Scheduled Jobs

There are two scheduled jobs that run every day:

- **Reminder Emails Job (7:00 AM)**: Sends email notifications to users with upcoming due reservations and to users with overdue returns.
- **Late Return Charge Job (8:00 AM)**: Applies late return fees to users with overdue books, deducting the penalty amount from their balance. If the accumulated late fees reach the book's retail price, the user is considered to have purchased it.

## Running Tests

To run the unit tests, use the following command:
```bash
  npm run test