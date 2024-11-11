import React, { useEffect, useState, useRef } from 'react';
import Client from './Client';
import Editor from './Editor';
import { initSocket } from '../socket';
import { useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import executeCode from './CodeRun'; // Import the executeCode function

function EditorPage() {
    const [clients, setClients] = useState([]);
    const [messages, setMessages] = useState([]);
    const [language, setLanguage] = useState('5'); // Default language choice (Python)
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const socketRef = useRef(null);
    const messageRef = useRef();
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const codeRef = useRef(null); // Store code content here

    // Supported languages in the API with their respective codes
    const languages = [
        { code: '5', name: 'Python' },
        { code: '4', name: 'Java' },
        { code: '17', name: 'JavaScript' },
        { code: '7', name: 'C++' },
        { code: '6', name: 'C' },
        
    ];

    useEffect(() => {
        const init = async () => {
            const handleError = (e) => {
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
                setClients(clients);
                socketRef.current.emit('sync-code', { code: codeRef.current, socketId });
            });

            socketRef.current.on('userLeft', ({ socketId, username }) => {
                if (username) {
                    toast.success(`${username} left the room`);
                    setClients((prev) => prev.filter((client) => client.socketId !== socketId));
                }
            });

            socketRef.current.on('newMessage', (message) => {
                if (message.username !== location.state?.username) {
                    setMessages((prev) => [...prev, message]);
                }
            });
        };
        init();

        return () => {
            socketRef.current.off('joined');
            socketRef.current.off('userLeft');
            socketRef.current.disconnect();
        };
    }, []);

    const handleSendMessage = () => {
        const message = messageRef.current.value;
        if (message.trim() === '') return;

        const newMessage = { username: location.state?.username, message };
        socketRef.current.emit('newMessage', newMessage);
        setMessages((prev) => [...prev, newMessage]);

        messageRef.current.value = '';
    };

    const handleRunCode = async () => {
        const code = codeRef.current;
        if (!code || !code.trim()) {
            toast.error("Error: Code cannot be empty");
            return;
        }

        setLoading(true); // Start loading
        const response = await executeCode(code, language);
        setLoading(false); // Stop loading

        if (response.success) {
            setOutput(response.output);
        } else {
            toast.error(`Error: ${response.output}`);
            setOutput(""); // Clear output in case of error
        }
    };

    if (!location.state) return <Navigate to="/" />;

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("Room Id copied");
        } catch (e) {
            toast.error("Unable to copy Id");
        }
    };

    const leaveRoom = () => navigate("/");

    return (
        <div className="container-fluid vh-100">
            <div className="row h-100">
                {/* Sidebar */}
                <div className="col-md-2 bg-dark text-light d-flex flex-column h-100">
                    <img src="/images/logo.png" alt="CodeCast" className="img-fluid mx-auto" style={{ maxWidth: '70px', marginTop: '10px' }} />
                    <hr />
                    <div className="d-flex flex-column">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={String(client.username)} />
                        ))}
                    </div>
                    <div className="mt-auto">
                        <hr />
                        <button onClick={copyRoomId} className="btn btn-success">Copy Room Id</button>
                        <button onClick={leaveRoom} className="mt-2 btn btn-danger mb-2 px-3 btn-block">Leave Room</button>
                    </div>
                </div>

                {/* Code Editor Area */}
                <div className="col-md-7 d-flex flex-column">
                    <div style={{ height: '60vh', overflow: 'auto', padding: '10px', border: '1px solid #333' }}>
                        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => (codeRef.current = code)} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <select
                            className="form-select"
                            style={{ width: '20%' }}
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleRunCode} className="btn btn-primary" disabled={loading}>
                            {loading ? "Running..." : "Run Code"}
                        </button>
                    </div>
                    <div className="mt-2" style={{ height: '20vh', overflowY: 'auto', padding: '10px', border: '1px solid #333', color: 'white' }}>
                        <strong>Output:</strong>
                        <pre>{output}</pre>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="col-md-3 d-flex flex-column" style={{ borderLeft: '1px solid #333' }}>
                    <div className="chat-box overflow-auto" style={{ flexGrow: 1, color: 'white' }}>
                        {messages.map((msg, index) => (
                            <div key={index}><strong>{msg.username}:</strong> {String(msg.message)}</div>
                        ))}
                    </div>
                    <div className="chat-input d-flex">
                        <input
                            type="text"
                            ref={messageRef}
                            className="form-control"
                            placeholder="Type a message"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button onClick={handleSendMessage} className="btn btn-primary">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditorPage;
