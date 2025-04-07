# Voi2Viz

A production-grade FastAPI application for managing and querying multiple database types (PostgreSQL, MySQL, CSV, Excel).

## Features

- User authentication with JWT tokens
- Support for multiple database types:
  - PostgreSQL
  - MySQL
  - CSV files
  - Excel files
- Secure storage of database configurations
- Dynamic query execution
- Role-based access control

## Prerequisites

- Python 3.10+
- PostgreSQL (for the main application database)
- MySQL (optional, for querying MySQL databases)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Voi2Viz
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp example.env .env
```
Then edit `.env` with your configuration values.

5. Run database migrations:
```bash
alembic upgrade head
```

## Running the Application

Start the FastAPI server:
```bash
python main.py
```

The API will be available at http://localhost:8000
API documentation is available at http://localhost:8000/docs

## API Endpoints

### Authentication
- POST `/api/v1/auth/login` - Login to get access token
- POST `/api/v1/users/` - Create new user (signup)

### Users
- GET `/api/v1/users/me` - Get current user info
- PUT `/api/v1/users/me` - Update current user

### Database Configurations
- POST `/api/v1/databases/` - Create new database configuration
- GET `/api/v1/databases/` - List all database configurations
- GET `/api/v1/databases/{config_id}` - Get specific database configuration
- PUT `/api/v1/databases/{config_id}` - Update database configuration
- DELETE `/api/v1/databases/{config_id}` - Delete database configuration
- POST `/api/v1/databases/query` - Execute query on configured database

## Security

- All endpoints except login and signup require authentication
- Passwords are hashed using bcrypt
- Database credentials are stored securely
- CORS protection enabled
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details