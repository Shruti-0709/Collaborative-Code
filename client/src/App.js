// import './App.css';
// import Home from './component/Home';
// import {Routes,Route} from "react-router-dom";
// import EditorPage from "./component/EditorPage";
// import {Toaster} from 'react-hot-toast';


// function App() {
//   return (
//     <>
//     <Toaster position = 'top-center'></Toaster>
//       <Routes>
//         <Route path="/" element={<Home/>}/>
//         <Route path="/editor/:roomId" element={<EditorPage/>}/>
//       </Routes>
//     </>
//   );
// }

// export default App;


import './App.css';
import Home from './component/Home';
import { Routes, Route } from "react-router-dom";
import EditorPage from "./component/EditorPage";
import { Toaster } from 'react-hot-toast';
import axios from 'axios'; // Added Axios for global config
import { useEffect } from 'react';

// Axios Global Configuration
axios.defaults.baseURL = 'http://localhost:5001'; // Backend Server URL
axios.defaults.headers.post['Content-Type'] = 'application/json';

function App() {

  // Global Error Handling Example (Optional)
  useEffect(() => {
    window.addEventListener('unhandledrejection', (event) => {
      console.error("Unhandled Promise Rejection:", event.reason);
    });
  }, []);

  return (
    <>
      <Toaster position='top-center' />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
        <Route path="*" element={<h1 className="text-center mt-5">404 - Page Not Found</h1>} /> {/* 404 Route */}
      </Routes>
    </>
  );
}

export default App;
