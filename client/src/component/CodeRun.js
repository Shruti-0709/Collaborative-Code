// import axios from 'axios';

// const executeCode = async (code, languageChoice) => {
//     try {
//         const response = await axios.post(
//             'https://code-compiler.p.rapidapi.com/v2',
//             {
//                 LanguageChoice: languageChoice,  // Language code, like "5" for Python
//                 Program: code,
//                 Input: "", // You can add an input parameter if needed
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-RapidAPI-Host': 'code-compiler.p.rapidapi.com',
//                     'X-RapidAPI-Key': 'dfdd0e6370msh7713ca2e6f871aap1309b8jsn2a060f288bc8', // Replace with your API key if different
//                 },
//             }
//         );

//         // Log the full response for debugging purposes
//         console.log('API Response:', response.data);

//         if (response.data && response.data.Result !== undefined) {
//             return {
//                 success: true,
//                 output: response.data.Result || "No output received.",
//             };
//         } else {
//             return {
//                 success: false,
//                 output: "Unexpected response format or no output returned from the server.",
//             };
//         }
//     } catch (error) {
//         return {
//             success: false,
//             output: `Error: ${error.message}`,
//         };
//     }
// };

// export default executeCode;


import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5001'); // Replace with your backend URL

const CodeRun = ({ roomId }) => {
    const [code, setCode] = useState('');
    const [languageChoice, setLanguageChoice] = useState('5'); // Default to Python
    const [output, setOutput] = useState('');
    const [executing, setExecuting] = useState(false);

    // Fetch existing code from MongoDB when component mounts
    useEffect(() => {
        const fetchCode = async () => {
            try {
                const response = await axios.get(`/api/code/${roomId}`);
                if (response.data.code) {
                    setCode(response.data.code);
                }
            } catch (error) {
                console.error('Error fetching code:', error);
            }
        };

        fetchCode();

        // Join the room for real-time collaboration
        socket.emit('join', { roomId });

        // Listen for code changes from other users
        socket.on('code-change', (newCode) => {
            setCode(newCode);
        });

        // Cleanup on component unmount
        return () => {
            socket.emit('leave', { roomId });
            socket.off('code-change');
        };
    }, [roomId]);

    // Handle code changes
    const handleCodeChange = (newCode) => {
        setCode(newCode);
        socket.emit('code-change', { roomId, code: newCode });

        // Save to MongoDB
        axios.post(`/api/code/${roomId}`, { code: newCode }).catch((error) =>
            console.error('Error saving code:', error)
        );
    };

    // Execute code via RapidAPI
    const executeCode = async () => {
        setExecuting(true);
        try {
            const response = await axios.post(
                'https://code-compiler.p.rapidapi.com/v2',
                {
                    LanguageChoice: languageChoice,
                    Program: code,
                    Input: '', // Add input handling if needed
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RapidAPI-Host': 'code-compiler.p.rapidapi.com',
                        'X-RapidAPI-Key': 'dfdd0e6370msh7713ca2e6f871aap1309b8jsn2a060f288bc8', // Replace with your API key
                    }
                }
            );

            setOutput(response.data.Result || 'No output received.');
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div>
            <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Write your code here..."
                style={{ width: '100%', height: '60vh', fontFamily: 'monospace' }}
            ></textarea>
            <div>
                <select
                    value={languageChoice}
                    onChange={(e) => setLanguageChoice(e.target.value)}
                >
                    <option value="5">Python</option>
                    <option value="6">JavaScript</option>
                    <option value="7">Java</option>
                    {/* Add more languages as needed */}
                </select>
                <button onClick={executeCode} disabled={executing}>
                    {executing ? 'Executing...' : 'Run Code'}
                </button>
            </div>
            <div>
                <h3>Output:</h3>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default CodeRun;
