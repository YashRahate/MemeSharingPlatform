# Meme Sharing Platform

A web-based Meme Platform designed to facilitate the sharing and interaction of meme content within a social media-inspired environment.

## 📌 Abstract

As digital content consumption grows, platforms enabling user-generated content and social engagement are increasingly valuable. The platform incorporates features such as user authentication, follow functionality, meme uploads, and interactive elements like likes and comments. Built using a React (Vite) frontend, Flask backend, MongoDB for data storage, and Cloudinary for image hosting, the system ensures scalability and seamless user experience.

## 🧩 Features

### 1. User Authentication
- Sign up/login functionality
- Passwords are hashed and stored in MongoDB
- Session management using JWT

### 2. User Search and Follow
- Search bar with autocomplete
- Follow/unfollow functionality

### 3. Meme Upload
- Upload images to Cloudinary
- Metadata stored in MongoDB

### 4. Social Feed
- Card-based feed showing memes from followed users

### 5. Like and Comment
- Users can like and comment on memes
- CRUD support for interactions

## 🛠️ Technology Stack

### Frontend
- React (Vite)
- Axios, React Router, Tailwind CSS

### Backend
- Flask (Python)
- Flask-JWT-Extended, PyMongo, Cloudinary SDK

### Database
- MongoDB (Collections: users, memes, interactions)

### Image Storage
- Cloudinary (Organized by user ID)

## 🏗️ System Architecture

- **Frontend**: React-based UI sending HTTP requests
- **Backend**: Flask REST APIs handling logic
- **Database**: MongoDB for all structured data
- **Image Hosting**: Cloudinary

## 🧠 Challenges & Solutions

- **Efficient Feed Retrieval**: Used indexed MongoDB queries
- **Image Uploads**: Cloudinary optimization + lazy loading
- **Real-time Interaction**: Polling/WebSockets for updates

## 🚀 Future Enhancements

- Real-time notifications (likes, comments, followers)
- Meme categorization and tags
- Personalized meme recommendation system
- Support for video memes

## ✅ Conclusion

The Meme Platform successfully delivers a social media experience tailored for meme sharing and interaction. Using modern web technologies, the system is robust, scalable, and user-friendly.

## 🔗 References

- [React Docs](https://react.dev/)
- [Flask Docs](https://flask.palletsprojects.com/)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
