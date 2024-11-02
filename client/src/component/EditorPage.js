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
                setClient(clients);
            });



            socketRef.current.on('Disconnected', ({ socketId, username }) => {
                toast.success(`${username} left the room`);
                setClient((prev) => prev.filter((client) => client.socketId !== socketId));
            });
        };
        init();

        return () => {
            socketRef.current.disconnect();
            socketRef.current.off('joined');
            socketRef.current.off('Disconnected');
        };

    }, []);

    if (!location.state) {
        return <Navigate to="/" />;
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
                        <button className='btn btn-success'>Copy Room Id</button>
                        <button className='mt-2 btn btn-danger mb-2 px-3 btn-block' >
                           
                            Leave Room</button>
                    </div>
                </div>
                <div className='col-md-10 text-light d-flex flex-column h-100'>
                    <Editor />
                </div>
            </div>
        </div>
    );
}

export default EditorPage;

