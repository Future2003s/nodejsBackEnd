# 🛒 E-Commerce Backend API

A comprehensive e-commerce backend API built with Node.js, TypeScript, Express.js, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management, email verification
- **Product Management**: CRUD operations, categories, inventory tracking
- **Shopping Cart**: Add/remove items, quantity management, cart persistence
- **Order Management**: Order processing, status tracking, order history
- **Payment Integration**: Support for multiple payment gateways (Stripe, VNPay)
- **Review System**: Product reviews and ratings
- **Admin Dashboard**: Complete admin panel APIs
- **Search & Filtering**: Advanced product search and filtering
- **File Upload**: Image upload with validation
- **Email Notifications**: Automated email system
- **Caching**: Redis integration for performance
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Structured logging with Winston
- **API Documentation**: Swagger/OpenAPI documentation

## 🏗️ Architecture

This project follows Clean Architecture principles with the following structure:

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models (Mongoose)
├── routes/         # API routes
├── services/       # Business logic layer
├── repositories/   # Data access layer
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── scripts/        # Database scripts (seed, migrate)
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Caching**: Redis
- **Logging**: Winston
- **Security**: Helmet, CORS, bcryptjs
- **Documentation**: Swagger

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Redis (optional, for caching)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd backendShopDev
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=8081
DATABASE_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key
# ... other configurations
```

### 4. Start MongoDB

Make sure MongoDB is running on your system.

### 5. Run the application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:8081`

## 📚 API Documentation

Once the server is running, you can access:

- **API Documentation**: `http://localhost:8081/api-docs`
- **Health Check**: `http://localhost:8081/health`

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Fix code formatting
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run seed` - Seed database with sample data
- `npm run migrate` - Run database migrations

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/forgot-password` - Forgot password
- `PUT /api/v1/auth/reset-password/:token` - Reset password

### Users

- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/addresses` - Add address
- `PUT /api/v1/users/addresses/:id` - Update address

### Products

- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Orders

- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get single order
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/:id/status` - Update order status (Admin)

### Cart

- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:id` - Update cart item
- `DELETE /api/v1/cart/items/:id` - Remove item from cart

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize and validate inputs
- **Password Hashing**: bcryptjs for secure password storage
- **JWT**: Secure token-based authentication

## 📊 Monitoring & Logging

- **Winston**: Structured logging
- **Morgan**: HTTP request logging
- **Health Checks**: Monitor application health
- **Error Tracking**: Comprehensive error handling

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Using PM2

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name "ecommerce-api"
```

### Using Docker

```bash
# Build image
docker build -t ecommerce-api .

# Run container
docker run -p 8081:8081 ecommerce-api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For support, email support@yourcompany.com or create an issue in the repository.
