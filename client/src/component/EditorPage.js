import React, { useEffect, useState, useRef } from 'react';
import Client from './Client';
import Editor from './Editor';
import { initSocket } from '../socket';
import { useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import executeCode from './CodeRun';

function EditorPage() {
    const [clients, setClients] = useState([]);
    const [messages, setMessages] = useState([]);
    const [language, setLanguage] = useState('5');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const socketRef = useRef(null);
    const messageRef = useRef();
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const codeRef = useRef(null);

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
    }, [location.state?.username, navigate, roomId]);

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

        setLoading(true);
        const response = await executeCode(code, language);
        setLoading(false);

        if (response.success) {
            setOutput(response.output);
        } else {
            toast.error(`Error: ${response.output}`);
            setOutput("");
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
                        <button onClick={() => setShowChat(!showChat)} className="btn btn-secondary">Toggle Chat</button>
                    </div>
                </div>

                <div className={showChat ? "col-md-7 d-flex flex-column" : "col-md-10 d-flex flex-column"}>
                    <div style={{ height: 'calc(80vh - 60px)', overflow: 'auto', padding: '10px', border: '1px solid #333' }}>
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
                    <div className="mt-2" style={{ height: 'calc(26vh - 60px)', overflowY: 'auto', padding: '10px', border: '1px solid #333', color: 'white' }}>
                        <strong>Output:</strong>
                        <pre>{output}</pre>
                    </div>
                </div>

                {showChat && (
                    <div className="col-md-3 d-flex flex-column position-relative" style={{ borderLeft: '1px solid #333' }}>
                        <button
                            onClick={() => setShowChat(false)}
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                color: 'white',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                        >
                            &#x2715;
                        </button>
                        <div
                            className="chat-box overflow-auto"
                            style={{
                                flexGrow: 1,
                                color: 'white',
                                paddingTop: '40px',
                                paddingRight: '10px',
                                paddingLeft: '10px'
                            }}
                        >
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`d-flex ${msg.username === location.state?.username ? 'justify-content-end' : 'justify-content-start'}`}
                                >
                                    <div
                                        className={`message-box p-2 mb-2 ${msg.username === location.state?.username ? 'bg-primary text-light' : 'bg-secondary text-light'}`}
                                        style={{ maxWidth: '70%', borderRadius: '10px', paddingTop: '20px' }} // Added padding to lower text
                                    >
                                        {msg.username !== location.state?.username && <strong>{msg.username}</strong>}
                                        <div>{msg.message}</div>
                                    </div>
                                </div>
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
                )}
            </div>
        </div>
    );
}

export default EditorPage;
