# Cybernauts Network - Interactive User Relationship & Hobby Network

A full-stack application for visualizing and managing user relationships and hobbies through an interactive graph interface.

---

## 🚀 Features

### 🎯 Core Functionality
- **Interactive Graph Visualization**: Drag-and-drop interface using React Flow  
- **User Management**: Create, update, and delete users with validation  
- **Relationship Management**: Build connections between users with circular prevention  
- **Hobby Management**: Drag-and-drop hobbies onto user nodes  
- **Popularity Scoring**: Dynamic scoring based on relationships and shared hobbies  

### ⚙️ Technical Features
- **TypeScript**: Full type safety across frontend and backend  
- **Real-time Updates**: Automatic popularity score recalculation  
- **Error Handling**: Comprehensive error handling with user feedback  
- **Responsive Design**: Mobile-friendly interface  
- **Testing**: Jest test suite for backend API  

---

## 🧰 Tech Stack

### 🖥️ Frontend (`cybernauts-frontend`)
- **Framework**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Visualization**: [React Flow](https://reactflow.dev/)
- **UI Feedback**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Tooling**: 
  - Vite
  - TypeScript
  - @vitejs/plugin-react
- **Dev Commands**:
  - `npm run dev` – Start development server
  - `npm run build` – Build for production
  - `npm run preview` – Preview production build

### 🛠️ Backend (`cybernauts-backend`)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: TypeScript
 
- **Database**: PostgreSQL via `pg`
- **Caching / Session**: Redis
- **Security**:
  - Helmet
  - CORS
- **Environment Variables**: dotenv
- **Testing**: 
  - Jest
  - Supertest
- **Dev Tools**:
  - ts-node-dev
  - TypeScript
- **Dev Commands**:
  - `npm run dev` – Run in development mode
  - `npm run build` – Compile TypeScript
  - `npm start` – Start built server
  - `npm test` – Run test suite
  - `npm run test:watch` – Watch mode for testing



