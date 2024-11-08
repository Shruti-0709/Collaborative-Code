import React, { useEffect, useState, useRef } from 'react';
import Client from './Client';
import Editor from './Editor';
import { initSocket } from '../socket';
import { useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function EditorPage() {
    const [clients, setClient] = useState([]); 
    const socketRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const codeRef=useRef(null) ;
    

    useEffect(() => {
        const init = async () => {
            const handleError = (e) => {
                console.log('socket error =>', e);
                toast.error("Socket Connection Failed");
                navigate('/');
            };

            socketRef.current = await initSocket();
            
            socketRef.current.on('connect_error', handleError);
            socketRef.current.on('connect_failed', handleError);

            socketRef.current.emit('join', {
                roomId,
                username: location.state?.username,
            });
            socketRef.current.on('joined', ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room`);
                }
            
                // Accessing the correct username field from the object
                setClient(clients.map(client => ({
                    socketId: client.socketId,
                    username: client.username.username // Access the username from the object
                })));

            socketRef.current.emit('sync-code',{
                code:codeRef.current,
                socketId
                });
            });
            
            socketRef.current.on("userLeft", ({ socketId, username }) => {
                if (username) {
                    console.log(`Received disconnect event: ${username} left the room`);
                    toast.success(`${username} left the room`);
                    setClient((prev) => prev.filter((client) => client.socketId !== socketId));
                } else {
                    console.log(`Disconnected event received without username`);
                }
            });
          
console.log("Disconnected event listener attached");
        };
        init();

        return () => {
            socketRef.current.off('joined');
            socketRef.current.off('Disconnected');
            socketRef.current.disconnect();
        };

    }, []);

    if (!location.state) {
        return <Navigate to="/" />;
    }

    const copyRoomId=async ()=>{
        try{
            await navigator.clipboard.writeText(roomId);
            toast.success("Room Id copied");
        }
        catch(e){
            toast.error("Unable to copy Id");
        }
    };
    const leaveRoom=()=>{
        navigate("/");
    }
    return (
        <div className='container-fluid vh-100'>
            <div className='row h-100'>
                <div className='col-md-2 bg-dark text-light d-flex flex-column h-100' style={{ boxShadow: "2px 0px 4px rgba(0,0,0,0.1)" }}>
                    <img src="/images/logo.png"
                        alt='CodeCast'
                        className='img-fluid mx-auto'
                        style={{ maxWidth: '70px', marginTop: '10px' }}
                    />
                    <hr style={{ marginTop: "1rem" }} />
                    <div className='d-flex flex-column overflow-auto'>
                    {clients.map((client) => (
    <Client key={client.socketId} username={client.username} />
))}
                    </div>
                    <div className='mt-auto'>
                        <hr />
                        <button onClick={copyRoomId} className='btn btn-success'>Copy Room Id</button>
                        <button onClick={leaveRoom} className='mt-2 btn btn-danger mb-2 px-3 btn-block' >Leave Room</button>
                    </div>
                </div>
                <div className='col-md-10 text-light d-flex flex-column h-100'>
                    <Editor socketRef={socketRef} 
                    roomId={roomId}
                    onCodeChange={(code)=>{
                        codeRef.current = code;
                    }}
                    />
                </div>
            </div>
        </div>
    );   
}

export default EditorPage;

