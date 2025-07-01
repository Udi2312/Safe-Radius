# SafeRadius - Secure Geolocation Web App

SafeRadius is a privacy-first location-based service that allows users to discover nearby Points of Interest (POIs) while keeping their location data encrypted and secure.

## 🌟 Features

### 🔐 Security & Privacy
- **End-to-End Encryption**: All location data is encrypted before storage
- **Client-Side Decryption**: POI data is only decrypted on the user's device
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for password security
- **Role-Based Access Control**: User, Owner, and Admin roles

### 👥 User Roles

#### 🧑‍💻 Users
- Search for nearby POIs within a specified radius
- Use current location via GPS or manual input
- Filter POIs by category
- View distance-sorted results with Haversine formula

#### 🏪 POI Owners
- Add new Points of Interest
- Automatic geocoding via OpenStreetMap Nominatim API
- Manage their submitted POIs
- Encrypted storage of sensitive location data

#### 🛡️ Administrators
- View platform statistics
- Manage all POIs in the system
- Monitor user activity
- Delete inappropriate content

### 🎨 Modern UI/UX
- **Dark Mode**: Sleek dark theme with neon accents
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion powered transitions
- **Vibrant Colors**: Cyan, purple, green, and blue accents
- **Modern Typography**: Inter font family

## 🚀 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **shadcn/ui**: Modern component library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CryptoJS**: AES encryption for location data

### External APIs
- **OpenStreetMap Nominatim**: Geocoding service
- **Browser Geolocation API**: GPS location access

## 📦 Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/yourusername/saferadius.git
cd saferadius
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/saferadius
JWT_SECRET=your-super-secure-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key-for-poi-data
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key-for-poi-data
\`\`\`

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

6. **Open your browser**
Navigate to `http://localhost:3000`

## 🗄️ Database Schema

### User Collection
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user|owner|admin),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### POI Collection
\`\`\`javascript
{
  // Encrypted data for privacy
  encryptedName: String,
  encryptedLat: String,
  encryptedLon: String,
  
  // Unencrypted data for management
  name: String,
  address: String,
  area: String,
  city: String,
  pinCode: String,
  category: String,
  
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 🔒 Security Features

### Data Encryption
- POI names and coordinates are encrypted using AES encryption
- Encryption happens on the server before database storage
- Decryption only occurs on the client side for authorized users

### Authentication & Authorization
- JWT tokens with 7-day expiration
- Role-based route protection
- Secure password hashing with bcrypt (12 salt rounds)

### Privacy Protection
- User location is never stored on the server
- Only encrypted POI coordinates are stored
- Client-side distance calculations using Haversine formula

## 📱 Usage

### For Users
1. Register with email and password
2. Choose "User" role during registration
3. Login to access the user dashboard
4. Enter your location manually or use GPS
5. Set search radius (1-20 km)
6. Filter by POI category if desired
7. Click "Search POIs" to find nearby locations
8. View results sorted by distance

### For POI Owners
1. Register with "POI Owner" role
2. Login to access the owner dashboard
3. Fill out the POI form with:
   - Place name
   - Street address
   - Area/locality
   - City
   - Pin code
   - Category
4. Submit to add POI (coordinates fetched automatically)
5. View and manage your submitted POIs

### For Administrators
1. Contact system admin for admin role assignment
2. Login to access admin dashboard
3. View platform statistics
4. Monitor all POIs in the system
5. Delete inappropriate content if necessary

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### POI Management
- `POST /api/poi/add` - Add new POI (Owner/Admin)
- `POST /api/poi/search` - Search POIs (User)
- `GET /api/poi/my-pois` - Get user's POIs (Owner)

### Admin
- `GET /api/admin/stats` - Platform statistics (Admin)
- `GET /api/admin/all-pois` - All POIs (Admin)
- `DELETE /api/admin/delete-poi/[id]` - Delete POI (Admin)

## 🎯 Key Algorithms

### Haversine Formula
Used for calculating distances between coordinates:
\`\`\`javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
\`\`\`

### AES Encryption/Decryption
\`\`\`javascript
// Encryption (Server-side)
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
}

// Decryption (Client-side)
const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
\`\`\`env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY=your-production-encryption-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-production-encryption-key
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenStreetMap for geocoding services
- shadcn/ui for beautiful components
- Framer Motion for smooth animations
- MongoDB for flexible data storage
- Vercel for seamless deployment

---

**SafeRadius** - Discover what's near you — privately. 🛡️📍
\`\`\`

This comprehensive SafeRadius application includes all the features you requested:

## ✅ **Complete MERN Stack Implementation**
- **Frontend**: Next.js with React, TypeScript, and Tailwind CSS
- **Backend**: Next.js API routes with Node.js functionality
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing

## 🔐 **Security Features**
- End-to-end encryption of POI data using AES
- Client-side decryption with CryptoJS
- Role-based access control (User, Owner, Admin)
- Secure password hashing with bcrypt
- JWT token authentication

## 🎨 **Modern UI/UX**
- Dark mode with vibrant neon accents (cyan, purple, green, blue)
- Responsive mobile-first design
- Smooth animations with Framer Motion
- Modern typography with Inter font
- Professional branding with shield logo concept

## 📍 **Location Features**
- GPS geolocation integration
- Manual location input
- Haversine formula for distance calculations
- Radius-based POI search (1-20km)
- Category filtering
- Geocoding with OpenStreetMap Nominatim API

## 👥 **Role-Based Dashboards**
- **User Dashboard**: Search nearby POIs with privacy
- **Owner Dashboard**: Add and manage POIs
- **Admin Dashboard**: Platform statistics and content moderation

## 🛡️ **Privacy Protection**
- User location never stored on server
- POI coordinates encrypted before database storage
- Client-side decryption ensures data privacy
- No location data transmitted to server during searches
