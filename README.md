# Savings Management System - Admin Panel

A modern web application built with Next.js for managing customer accounts, verifying devices, and monitoring transactions in a savings management system.

## 🚀 Features

- **Dashboard Analytics**
  - Real-time transaction monitoring
  - User verification statistics
  - Visual data representation with charts
- **Customer Management**
  - View all registered customers
  - Device verification control
  - Customer account status monitoring
- **Transaction Monitoring**
  - View all deposits and withdrawals
  - Transaction history tracking
  - Filter and search capabilities

## 🛠️ Tech Stack

- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **State Management:** React Hooks
- **API Integration:** Custom API utilities
- **Authentication:** JWT-based auth
- **Deployment:** Vercel (recommended)

## 📦 Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin routes
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── customers/     # Customer management
│   │   ├── dashboard/     # Main dashboard page
│   │   └── transactions/  # Transaction monitoring
├── components/            # Reusable UI components
├── lib/                   # Utilities and API functions
└── public/               # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Access to the backend API server

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/regis-mugisha/savings-ms-admin.git
   cd savings-ms-admin/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛣️ Routes

- `/` - Login page
- `/dashboard` - Main dashboard with analytics
- `/customers` - Customer management
- `/transactions` - Transaction monitoring
- `/analytics` - Data visualization(Charts)

## 🔐 Authentication

The admin panel uses JWT-based authentication. Login credentials are required to access any route within the application.

## 🎯 Key Features Details

### Analytics Dashboard

- Transaction volume tracking
- User verification statistics
- Real-time data visualization
- Trend analysis

### Customer Management

- View customer details
- Device verification control
- Account status monitoring
- Search and filter functionality

### Transaction Monitoring

- View all financial transactions
- Filter by date and type
- Transaction details viewing
- Export capabilities

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Push your code to a Git repository
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## 📚 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 👥 Authors

- Regis MUGISHA - Initial work

## 🙏 Acknowledgments

- shadcn/ui for the amazing component library
- Vercel for Next.js

---

For the mobile app and backend repositories, please check:

- [Mobile App Repository](https://github.com/regis-mugisha/savings-ms-client/tree/main/mobile)
- [Backend Repository](https://github.com/regis-mugisha/savings-ms-client/tree/main/backend)
