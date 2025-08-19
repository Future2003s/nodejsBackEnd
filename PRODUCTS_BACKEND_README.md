# Products Backend - Hệ Thống Quản Lý Sản Phẩm Hoàn Chỉnh

## 🚀 **Tổng Quan**

Backend này cung cấp một hệ thống quản lý sản phẩm hoàn chỉnh với đầy đủ tính năng CRUD, validation, và business logic cho e-commerce platform.

## 🏗️ **Kiến Trúc Hệ Thống**

### **Models:**

- **Product**: Quản lý thông tin sản phẩm
- **Category**: Phân loại sản phẩm
- **Brand**: Thương hiệu sản phẩm
- **User**: Người dùng và admin

### **Controllers:**

- **ProductController**: Xử lý logic nghiệp vụ sản phẩm
- **CategoryController**: Quản lý danh mục
- **BrandController**: Quản lý thương hiệu

### **Middleware:**

- **Authentication**: Xác thực người dùng
- **Authorization**: Phân quyền admin
- **Validation**: Kiểm tra dữ liệu đầu vào
- **Error Handling**: Xử lý lỗi

### **Routes:**

- **Public APIs**: Lấy thông tin sản phẩm
- **Admin APIs**: Quản lý sản phẩm (CRUD)
- **Analytics APIs**: Thống kê và báo cáo

## 📊 **Cấu Trúc Dữ Liệu Sản Phẩm**

### **Product Fields:**

```typescript
interface IProduct {
    // Basic Information
    name: string; // Tên sản phẩm
    description: string; // Mô tả
    sku: string; // Mã sản phẩm

    // Pricing
    price: number; // Giá bán
    basePrice: number; // Giá gốc
    discountPrice?: number; // Giá khuyến mãi

    // Inventory
    stock: number; // Tồn kho
    minStock: number; // Tồn kho tối thiểu
    maxStock: number; // Tồn kho tối đa

    // Classification
    categoryId: ObjectId; // Danh mục
    brandId: ObjectId; // Thương hiệu
    status: ProductStatus; // Trạng thái

    // Media
    images: string[]; // Hình ảnh
    thumbnail: string; // Ảnh đại diện

    // Metadata
    tags: string[]; // Tags
    specifications: Record<string, any>; // Thông số kỹ thuật

    // Physical Properties
    weight: number; // Cân nặng
    dimensions: {
        // Kích thước
        length: number;
        width: number;
        height: number;
    };

    // Marketing
    isFeatured: boolean; // Sản phẩm nổi bật
    isNew: boolean; // Sản phẩm mới
    isBestSeller: boolean; // Bán chạy

    // Analytics
    rating: number; // Đánh giá trung bình
    reviewCount: number; // Số lượng đánh giá
    viewCount: number; // Lượt xem
    soldCount: number; // Số lượng đã bán

    // Timestamps
    createdAt: Date; // Ngày tạo
    updatedAt: Date; // Ngày cập nhật

    // Audit
    createdBy: ObjectId; // Người tạo
    updatedBy: ObjectId; // Người cập nhật
}
```

### **Product Status:**

- `ACTIVE`: Đang hoạt động
- `INACTIVE`: Ngừng kinh doanh
- `OUT_OF_STOCK`: Hết hàng
- `DISCONTINUED`: Ngừng sản xuất

## 🔌 **API Endpoints**

### **Public APIs (Không cần authentication):**

#### **1. Lấy danh sách sản phẩm**

```http
GET /api/v1/products
```

**Query Parameters:**

- `page`: Số trang (default: 0)
- `size`: Số lượng mỗi trang (default: 20)
- `categoryId`: ID danh mục
- `brandId`: ID thương hiệu
- `minPrice`: Giá tối thiểu
- `maxPrice`: Giá tối đa
- `sortBy`: Sắp xếp theo (name, price, stock, createdAt, rating, soldCount, viewCount)
- `sortOrder`: Thứ tự sắp xếp (asc, desc)

#### **2. Lấy sản phẩm theo ID**

```http
GET /api/v1/products/:id
```

#### **3. Lấy sản phẩm theo danh mục**

```http
GET /api/v1/products/category/:categoryId
```

#### **4. Tìm kiếm sản phẩm**

```http
GET /api/v1/products/search?q=keyword
```

### **Admin APIs (Cần authentication + admin role):**

#### **1. Lấy danh sách sản phẩm (Admin)**

```http
GET /api/v1/products/admin/all
```

**Query Parameters:**

- `page`: Số trang
- `size`: Số lượng mỗi trang
- `q`: Từ khóa tìm kiếm
- `categoryId`: ID danh mục
- `brandId`: ID thương hiệu
- `status`: Trạng thái sản phẩm

#### **2. Tạo sản phẩm mới**

```http
POST /api/v1/products/create
```

**Body:**

```json
{
    "name": "iPhone 15 Pro",
    "description": "The most advanced iPhone ever",
    "sku": "IPHONE15PRO-128",
    "price": 29990000,
    "basePrice": 29990000,
    "stock": 50,
    "categoryId": "category_id_here",
    "brandId": "brand_id_here",
    "thumbnail": "https://example.com/image.jpg",
    "images": ["https://example.com/image1.jpg"],
    "tags": ["smartphone", "apple"],
    "specifications": {
        "Screen Size": "6.1 inch",
        "Storage": "128GB"
    }
}
```

#### **3. Cập nhật sản phẩm**

```http
PUT /api/v1/products/:id
```

#### **4. Xóa sản phẩm (Soft delete)**

```http
DELETE /api/v1/products/:id
```

#### **5. Cập nhật trạng thái sản phẩm**

```http
PATCH /api/v1/products/:id/status
```

**Body:**

```json
{
    "status": "ACTIVE"
}
```

#### **6. Cập nhật tồn kho**

```http
PATCH /api/v1/products/:id/stock
```

**Body:**

```json
{
    "stock": 100,
    "operation": "set" // "set", "add", "subtract"
}
```

### **Bulk Operations:**

#### **1. Tạo nhiều sản phẩm**

```http
POST /api/v1/products/bulk/create
```

#### **2. Cập nhật nhiều sản phẩm**

```http
POST /api/v1/products/bulk/update
```

#### **3. Xóa nhiều sản phẩm**

```http
POST /api/v1/products/bulk/delete
```

### **Analytics APIs:**

#### **1. Tổng quan sản phẩm**

```http
GET /api/v1/products/admin/analytics/overview
```

#### **2. Thống kê tồn kho**

```http
GET /api/v1/products/admin/analytics/stock
```

#### **3. Thống kê theo danh mục**

```http
GET /api/v1/products/admin/analytics/category
```

### **Utility APIs:**

#### **1. Lấy danh sách trạng thái**

```http
GET /api/v1/products/statuses
```

## 🔧 **Cài Đặt Và Chạy**

### **1. Cài đặt dependencies:**

```bash
cd nodejsBackEnd
npm install
```

### **2. Cấu hình environment variables:**

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_here
PORT=8081
NODE_ENV=development
```

### **3. Khởi động MongoDB:**

```bash
# Start MongoDB service
mongod
```

### **4. Chạy backend:**

```bash
npm run dev
```

### **5. Seed dữ liệu mẫu:**

```bash
node seed-products.js
```

## 📝 **Validation Rules**

### **Product Validation:**

- **name**: 3-200 ký tự
- **description**: 10-2000 ký tự
- **sku**: 3-50 ký tự, chỉ chữ hoa, số, dấu gạch ngang
- **price**: Số dương, tối đa 1 tỷ
- **stock**: Số nguyên không âm, tối đa 1 triệu
- **categoryId**: MongoDB ObjectId hợp lệ
- **brandId**: MongoDB ObjectId hợp lệ
- **images**: Mảng URL hợp lệ
- **thumbnail**: URL hợp lệ

### **Category Validation:**

- **name**: 1-100 ký tự, unique
- **slug**: Tự động tạo từ name
- **description**: Tối đa 500 ký tự

### **Brand Validation:**

- **name**: 1-100 ký tự, unique
- **slug**: Tự động tạo từ name
- **website**: URL hợp lệ (optional)

## 🚨 **Error Handling**

### **HTTP Status Codes:**

- `200`: Thành công
- `201`: Tạo thành công
- `400`: Bad Request (validation error)
- `401`: Unauthorized (chưa đăng nhập)
- `403`: Forbidden (không có quyền)
- `404`: Not Found
- `500`: Internal Server Error

### **Error Response Format:**

```json
{
    "success": false,
    "message": "Error message",
    "error": "Detailed error",
    "details": {}
}
```

## 🔒 **Security Features**

### **Authentication:**

- JWT token-based authentication
- Token expiration handling
- Refresh token mechanism

### **Authorization:**

- Role-based access control (RBAC)
- Admin-only endpoints protection
- User permission validation

### **Input Validation:**

- Comprehensive data validation
- SQL injection prevention
- XSS protection
- Input sanitization

### **Rate Limiting:**

- API rate limiting
- Brute force protection
- DDoS mitigation

## 📊 **Performance Features**

### **Database Optimization:**

- Indexed fields for fast queries
- Text search indexes
- Compound indexes for complex queries
- Query optimization

### **Caching:**

- Response caching
- Database query caching
- Static data caching

### **Pagination:**

- Efficient pagination
- Cursor-based pagination
- Page size limits

## 🧪 **Testing**

### **Unit Tests:**

```bash
npm run test:unit
```

### **Integration Tests:**

```bash
npm run test:integration
```

### **API Tests:**

```bash
npm run test:api
```

## 📚 **Tài Liệu Tham Khảo**

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

## 🆘 **Hỗ Trợ**

Nếu gặp vấn đề:

1. Kiểm tra logs trong console
2. Kiểm tra MongoDB connection
3. Kiểm tra environment variables
4. Kiểm tra authentication/authorization
5. Tạo issue với đầy đủ thông tin

## 🔮 **Tính Năng Tương Lai**

- [ ] Product variants (size, color, etc.)
- [ ] Inventory management (warehouse, locations)
- [ ] Product reviews and ratings
- [ ] Product recommendations
- [ ] Advanced search and filtering
- [ ] Product import/export (CSV, Excel)
- [ ] Product analytics dashboard
- [ ] Multi-language support
- [ ] Product image optimization
- [ ] SEO management
