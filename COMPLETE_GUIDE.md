# 📘 COMPLETE PROJECT GUIDE

## 🎯 Project: Civic Issue Reporting & Tracking System

**Status**: ✅ 100% Complete & Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Features & Usage](#features--usage)
5. [AI Features Explained](#ai-features-explained)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [File Structure](#file-structure)
10. [API Documentation](#api-documentation)

---

## 📖 PROJECT OVERVIEW

### What is Civic Portal?

A full-stack web application that allows citizens to report civic issues (potholes, garbage, streetlights, etc.) with AI-powered features for intelligent issue management.

### Key Features

✅ **User Management**
- JWT authentication
- Role-based access (User, Authority, Admin)
- Secure password hashing

✅ **Issue Reporting**
- Photo upload with preview
- GPS location tracking
- Category selection
- Status tracking

✅ **AI Features**
- Image classification (TensorFlow.js MobileNet)
- OCR text extraction (Tesseract.js)
- Duplicate detection (3-factor algorithm)
- Spam detection (rate limiting + ratio)
- Severity scoring (rule-based AI)

✅ **Gamification**
- Points system
- Leaderboard
- User rankings

✅ **Admin Dashboard**
- System analytics
- User statistics
- Category breakdown

### Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS
- Axios
- Framer Motion
- TensorFlow.js
- Tesseract.js

**Backend:**
- Node.js + Express
- LowDB (JSON database)
- Multer (file uploads)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- image-hash (duplicate detection)

---

## 🚀 INSTALLATION

### Prerequisites

- Node.js v16+ installed
- npm or yarn
- Modern web browser (Chrome recommended)

### Method 1: Automatic Installation (Windows)

Double-click `INSTALL.bat` and wait for completion.

### Method 2: Manual Installation

**Step 1: Install Backend**
```bash
cd backend
npm install
```

**Step 2: Install Frontend**
```bash
cd frontend
npm install
```

### Verify Installation

Check that these folders exist:
- `backend/node_modules/`
- `frontend/node_modules/`

---

## 🎮 RUNNING THE APPLICATION

### Method 1: Automatic Start (Windows)

Double-click `START.bat` - This will:
1. Start backend server
2. Start frontend server
3. Open browser automatically

### Method 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:3000/
```

### Access the Application

Open browser: **http://localhost:3000**

---

## 🎯 FEATURES & USAGE

### 1. User Registration & Login

**Register New Account:**
1. Click "Don't have an account? Register"
2. Enter name, email, password
3. Click "Register"
4. Automatically logged in

**Login with Test Accounts:**
- **Admin**: admin@civic.com / password123
- **Authority**: authority@civic.com / password123

### 2. Report an Issue (User)

**Step-by-Step:**

1. **Login as User**
   - Register or use test account

2. **Click "Report Issue"**
   - Opens report form

3. **Upload Photo**
   - Click file input
   - Select image (JPEG/PNG, max 5MB)
   - Wait for AI analysis (~5-10 seconds)

4. **Review AI Results**
   - Image classification predictions
   - OCR extracted text
   - Auto-suggested category

5. **Fill Details**
   - Title: Brief description
   - Description: Detailed explanation
   - Category: Auto-filled or manual selection

6. **Add Location**
   - Click "Auto" for GPS location
   - Or enter manually (latitude, longitude)

7. **Submit**
   - Click "Submit Report"
   - Receive +10 points
   - View in "All Issues"

### 3. Verify Issues (Authority)

**Step-by-Step:**

1. **Login as Authority**
   - Use authority@civic.com

2. **View Pending Issues**
   - Click "All Issues"
   - See all pending reports

3. **Verify Issue**
   - Review issue details
   - Check photo and description
   - Click "Verify"
   - Status changes to "verified"
   - Reporter gets +5 points

4. **Resolve Issue**
   - Click "Mark Resolved"
   - Upload resolution photo (optional)
   - Click confirm
   - Status changes to "resolved"
   - Reporter gets +20 points

### 4. Admin Dashboard

**Step-by-Step:**

1. **Login as Admin**
   - Use admin@civic.com

2. **View Analytics**
   - Click "Analytics" tab
   - See system statistics:
     - Total issues
     - Resolved issues
     - Pending issues
     - Category breakdown
     - Severity breakdown

3. **Monitor System**
   - Track user activity
   - View spam reports
   - Monitor duplicate detection

### 5. Leaderboard

**View Rankings:**
1. Click "Leaderboard" tab
2. See top 10 users
3. View points and report count
4. Medals for top 3 (🥇🥈🥉)

---

## 🤖 AI FEATURES EXPLAINED

### 1. Image Classification (TensorFlow.js MobileNet)

**How it works:**
- Uses pre-trained MobileNet model
- Analyzes uploaded image
- Returns top 3 predictions with confidence scores
- Auto-suggests issue category

**Example:**
```
Upload: pothole.jpg
Results:
- pothole: 85.3%
- road damage: 12.1%
- asphalt: 2.6%

Auto-selected category: "pothole"
```

### 2. OCR Text Extraction (Tesseract.js)

**How it works:**
- Scans image for text
- Extracts readable characters
- Useful for street signs, landmarks
- Helps identify location

**Example:**
```
Upload: street_sign.jpg
Extracted: "Main Street & 5th Avenue"
```

### 3. Duplicate Detection (3-Factor Algorithm)

**Algorithm:**
```javascript
IF (
  Geographic Distance < 200 meters AND
  Text Similarity > 55% AND
  Image Hash Distance < 5
) THEN
  Mark as Duplicate
```

**Factors:**
1. **Geographic**: Haversine distance calculation
2. **Text**: Jaccard similarity on descriptions
3. **Image**: Perceptual hash comparison

**Example:**
```
Issue A: Pothole at (40.7128, -74.0060)
Issue B: Pothole at (40.7129, -74.0061)

Distance: 15 meters ✓
Text Similarity: 87% ✓
Image Hash: 3 bits different ✓

Result: DUPLICATE
```

### 4. Spam Detection (2-Factor Algorithm)

**Algorithm:**
```javascript
spamScore = 0

IF (reports > 10 in 10 minutes)
  spamScore += 2

IF (duplicate_ratio > 60%)
  spamScore += 2

IF (spamScore >= 3)
  Flag as SPAM
```

**Example:**
```
User reports 12 issues in 5 minutes
→ spamScore = 2

User has 8 duplicates out of 10 reports (80%)
→ spamScore = 4

Result: FLAGGED AS SPAM
```

### 5. Severity Scoring (Rule-Based AI)

**Algorithm:**
```javascript
score = 1 (base)

IF (description contains danger keywords)
  score += 2

IF (high priority category)
  score += 1

IF (AI predicts dangerous condition)
  score += 1

Severity Levels:
- score >= 4: CRITICAL
- score >= 3: HIGH
- score >= 2: MEDIUM
- score < 2: LOW
```

**Example:**
```
Issue: "Dangerous pothole causing accidents"
Category: pothole (high priority)
AI Prediction: road damage (dangerous)

Score: 1 + 2 + 1 + 1 = 5
Severity: CRITICAL
```

---

## 🧪 TESTING

### Quick Test Checklist

- [ ] Register new user
- [ ] Login with test accounts
- [ ] Upload image
- [ ] AI classification works
- [ ] OCR extraction works
- [ ] Submit issue report
- [ ] View issues list
- [ ] Authority verify issue
- [ ] Authority resolve issue
- [ ] Check points awarded
- [ ] View leaderboard
- [ ] Admin view analytics

### Detailed Testing

See **TESTING_GUIDE.md** for:
- 20-step QA checklist
- Test scenarios
- API testing with Postman
- Performance testing
- Security testing

### Test with Postman

1. Import `POSTMAN_COLLECTION.json`
2. Test all API endpoints
3. Verify responses

---

## 🚀 DEPLOYMENT

### Quick Deploy

**Frontend (Netlify):**
```bash
cd frontend
npm run build
# Upload dist/ folder to Netlify
```

**Backend (Render):**
```bash
# Push to GitHub
# Connect to Render
# Deploy automatically
```

### Detailed Deployment

See **DEPLOYMENT.md** for:
- Netlify deployment
- Render deployment
- Railway deployment
- Vercel deployment
- MongoDB migration
- AWS S3 integration
- Environment variables
- Production optimization

---

## 🐛 TROUBLESHOOTING

### Backend Issues

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Restart
cd backend
npm run dev
```

**Module not found:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Restart
cd frontend
npm run dev
```

**Build errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### AI Issues

**TensorFlow not loading:**
- Check internet connection
- Wait 30 seconds for model download
- Refresh browser
- Clear cache

**OCR not working:**
- Check image quality
- Use images with clear text
- Wait for processing
- Check console for errors

### Upload Issues

**Image upload fails:**
- Check file size < 5MB
- Use JPEG or PNG only
- Verify uploads folder exists
- Check file permissions

---

## 📁 FILE STRUCTURE

```
civic-portal/
├── backend/                    # Backend server
│   ├── data/
│   │   └── db.json            # JSON database
│   ├── routes/
│   │   ├── auth.js            # Authentication
│   │   └── issues.js          # Issue management
│   ├── utils/
│   │   └── severity.js        # Severity calculation
│   ├── uploads/               # Uploaded images
│   ├── db.js                  # Database config
│   ├── server.js              # Express server
│   └── package.json           # Dependencies
│
├── frontend/                   # Frontend app
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utilities
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite config
│   ├── tailwind.config.cjs    # Tailwind config
│   └── package.json           # Dependencies
│
├── README.md                   # Project overview
├── START_HERE.md              # Quick start guide
├── SETUP_GUIDE.md             # Installation guide
├── DEPLOYMENT.md              # Deployment guide
├── TESTING_GUIDE.md           # Testing procedures
├── PROJECT_SUMMARY.md         # Complete summary
├── POSTMAN_COLLECTION.json    # API collection
├── INSTALL.bat                # Auto installer
├── START.bat                  # Auto starter
└── .gitignore                 # Git ignore rules
```

---

## 📡 API DOCUMENTATION

### Authentication Endpoints

**Register User**
```
POST /api/auth/register
Body: { email, password, name }
Response: { token, user }
```

**Login User**
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Issue Endpoints

**Create Issue**
```
POST /api/issues
Headers: Authorization: Bearer <token>
Body: FormData {
  title, description, category,
  latitude, longitude, photo,
  aiPredictions, ocrText
}
Response: { issue, isDuplicate, isSpam }
```

**Get All Issues**
```
GET /api/issues?status=pending&category=pothole
Headers: Authorization: Bearer <token>
Response: { issues: [] }
```

**Get Single Issue**
```
GET /api/issues/:id
Headers: Authorization: Bearer <token>
Response: { issue }
```

**Update Issue Status**
```
PATCH /api/issues/:id/status
Headers: Authorization: Bearer <token>
Body: { status: "verified" }
Response: { issue }
```

### Statistics Endpoints

**Get Leaderboard**
```
GET /api/issues/stats/leaderboard
Headers: Authorization: Bearer <token>
Response: { leaderboard: [] }
```

**Get Analytics (Admin)**
```
GET /api/issues/stats/analytics
Headers: Authorization: Bearer <token>
Response: { analytics: {} }
```

---

## 🎓 LEARNING RESOURCES

### Technologies

- **React**: https://react.dev
- **Node.js**: https://nodejs.org
- **Express**: https://expressjs.com
- **TensorFlow.js**: https://www.tensorflow.org/js
- **Tesseract.js**: https://tesseract.projectnaptha.com
- **Tailwind CSS**: https://tailwindcss.com

### Tutorials

- React Hooks: https://react.dev/reference/react
- JWT Authentication: https://jwt.io
- Image Classification: https://www.tensorflow.org/js/tutorials
- OCR with Tesseract: https://github.com/naptha/tesseract.js

---

## 📞 SUPPORT

### Documentation Files

1. **START_HERE.md** - Quick start (5 minutes)
2. **SETUP_GUIDE.md** - Detailed installation
3. **TESTING_GUIDE.md** - Testing procedures
4. **DEPLOYMENT.md** - Production deployment
5. **PROJECT_SUMMARY.md** - Complete overview

### Common Issues

Check the **Troubleshooting** section above for:
- Port conflicts
- Module errors
- AI loading issues
- Upload problems

---

## ✅ PROJECT CHECKLIST

### Development
- [x] Backend API complete
- [x] Frontend UI complete
- [x] AI features integrated
- [x] Authentication working
- [x] File upload working
- [x] Database configured
- [x] All routes tested

### Documentation
- [x] README.md
- [x] Setup guide
- [x] Deployment guide
- [x] Testing guide
- [x] API documentation
- [x] Code comments

### Testing
- [x] Unit tests planned
- [x] Integration tests planned
- [x] Manual testing complete
- [x] Postman collection ready

### Deployment
- [x] Production ready
- [x] Environment variables documented
- [x] Deployment guides complete
- [x] Migration paths documented

---

## 🏆 PROJECT COMPLETION

**Status**: ✅ 100% COMPLETE

This project is fully functional and ready for:
- ✅ Local development
- ✅ Testing and QA
- ✅ Production deployment
- ✅ Presentation and demo
- ✅ Portfolio showcase
- ✅ Capstone submission

---

## 📝 LICENSE

MIT License - Free to use and modify

---

## 🎉 CONGRATULATIONS!

You now have a complete, production-ready full-stack application with AI features!

**Next Steps:**
1. Run the application
2. Test all features
3. Customize as needed
4. Deploy to production
5. Add to your portfolio

**Happy Coding! 🚀**

---

*For quick start, see START_HERE.md*
*For detailed setup, see SETUP_GUIDE.md*
*For deployment, see DEPLOYMENT.md*
