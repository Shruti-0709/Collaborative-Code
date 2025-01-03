// import React, { useState } from 'react';
// import {v4 as uuid} from 'uuid';
// import { toast } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';

// function Home() {
//     const [roomId, setRoomId] = useState("");
//     const [username, setUsername] = useState("");
//     const navigate = useNavigate();

//     const generateRoomId = (e) => {
//         e.preventDefault();
//         const id  = uuid();
//         setRoomId(id);
//         toast.success("Room Id Generated");
//     }

//     const joinRoom = () => {
//         if(!roomId || !username){
//             toast.error("Both the field is required");
//             return;
//         }

//         navigate(`/editor/${roomId}`,{
//             state : {username},
//         }); 
//         toast.success('Room is Created');  
//     };
 

//     return (
//         <div className='container-fluid'>
//             <div className='row justify-content-center align-items-center min-vh-100'>
//                <div className='col-12 col-md-6'>
//                 <div className='card shadow-sm p-2 mb-5 bg-secondary rounded'>
//                     <div className='card-body text-center bg-dark'>
//                         <img 
//                         src='/images/logo.png'
//                         className='img-fluid mx-auto d-block'
//                         style={{maxWidth:"150px"}}
//                         />
//                         <h4 className='text-light'> Enter the Room Id</h4>
//                         <div className='form-group'>
//                             <input 
//                             value={roomId}
//                             onChange={(e)=>setRoomId(e.target.value)} 
//                             type='text'
//                             className='form-control mb-2'
//                             placeholder='Room Id'/>
//                         </div>      
//                         <div className='form-group'>
//                         <input
//                         value ={username}
//                         onChange={(e)=>setUsername(e.target.value)}
//                         type='text'
//                         className='form-control mb-2'
//                         placeholder='Username'/>
//                         </div>
//                         <button onClick={joinRoom} className='btn btn-success btn-lg btn-block'>JOIN</button>
//                         <p className='mt-3 text-light'>
//                         Don't have a room Id?
//                         <span className='text-success p-2 ' style={{cursor:"pointer"}}
//                         onClick={generateRoomId}>New Room</span>
//                         </p>
//                     </div>
//                 </div>
//                </div>
//             </div>
//         </div>
//     )
// }

// export default Home


import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Added for MongoDB API calls

function Home() {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    // Generate a Room ID and create an entry in MongoDB
    const generateRoomId = async (e) => {
        e.preventDefault();
        const id = uuid();
        setRoomId(id);
        toast.success("Room Id Generated");

        try {
            // Create a new room entry in MongoDB
            await axios.post(`http://localhost:5001/code/${id}`, { code: "" });
        } catch (err) {
            console.error("Failed to create room:", err);
            toast.error("Failed to create room in database");
        }
    };

    // Join Room (check if the room exists in MongoDB)
    const joinRoom = async () => {
        if (!roomId || !username) {
            toast.error("Both fields are required");
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5001/code/${roomId}`);
            if (!res.data) {
                toast.error("Room does not exist!");
                return;
            }

            navigate(`/editor/${roomId}`, {
                state: { username },
            });
            toast.success('Joined the Room');
        } catch (err) {
            console.error("Error checking room existence:", err);
            toast.error("Room does not exist!");
        }
    };

    return (
        <div className='container-fluid'>
            <div className='row justify-content-center align-items-center min-vh-100'>
                <div className='col-12 col-md-6'>
                    <div className='card shadow-sm p-2 mb-5 bg-secondary rounded'>
                        <div className='card-body text-center bg-dark'>
                            <img
                                src='/images/logo.png'
                                className='img-fluid mx-auto d-block'
                                style={{ maxWidth: "150px" }}
                            />
                            <h4 className='text-light'> Enter the Room Id</h4>
                            <div className='form-group'>
                                <input
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    type='text'
                                    className='form-control mb-2'
                                    placeholder='Room Id'
                                />
                            </div>
                            <div className='form-group'>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    type='text'
                                    className='form-control mb-2'
                                    placeholder='Username'
                                />
                            </div>
                            <button onClick={joinRoom} className='btn btn-success btn-lg btn-block'>JOIN</button>
                            <p className='mt-3 text-light'>
                                Don't have a room Id?
                                <span className='text-success p-2 ' style={{ cursor: "pointer" }}
                                    onClick={generateRoomId}>New Room</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
