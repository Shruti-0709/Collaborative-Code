// import React, { useEffect, useRef } from "react";
// import "codemirror/mode/javascript/javascript";
// import "codemirror/theme/dracula.css";
// import "codemirror/addon/edit/closetag";
// import "codemirror/addon/edit/closebrackets";
// import "codemirror/lib/codemirror.css";
// import CodeMirror from "codemirror";
 
// function Editor({ socketRef, roomId, onCodeChange }) {
//     const editorRef = useRef(null);

//     useEffect(() => {
//         const init = async () => {
//             const editor = CodeMirror.fromTextArea(
//                 document.getElementById("realTimeEditor"),
//                 {
//                     mode: { name: "javascript", json: true },
//                     theme: "dracula",
//                     autoCloseTags: true,
//                     autoCloseBrackets: true,
//                     lineNumbers: true
//                 }
//             );
//             editor.setSize(null, '100%');
//             editorRef.current = editor;
//             editorRef.current.on("change", (instance, changes) => {
//                 const { origin } = changes;
//                 const code = instance.getValue();
//                 onCodeChange(code);
//                 if (origin !== 'setValue') {
//                     socketRef.current.emit("code-change", { roomId, code });
//                 }
//             });
//         };
//         init();
//     }, []);

//     useEffect(() => {
//         if (socketRef.current) {
//             socketRef.current.on("code-change", ({ code }) => {
//                 if (code !== null) editorRef.current.setValue(code);
//             });
//         }
//         return () => socketRef.current.off("code-change");
//     }, [socketRef.current]);

//     return (
//         <div style={{ overflowY: "auto", height: "100%" }}>
//             <textarea id="realTimeEditor"></textarea>
//         </div>
//     );
// }

// export default Editor;



import React, { useEffect, useRef, useState } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import axios from 'axios'; // Added axios for API calls

function Editor({ socketRef, roomId, onCodeChange }) {
    const editorRef = useRef(null);
    const [isCodeLoaded, setIsCodeLoaded] = useState(false); // State to track code loading

    useEffect(() => {
        const init = async () => {
            const editor = CodeMirror.fromTextArea(
                document.getElementById("realTimeEditor"),
                {
                    mode: { name: "javascript", json: true },
                    theme: "dracula",
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true
                }
            );
            editor.setSize(null, '100%');
            editorRef.current = editor;

            // Fetch initial code from MongoDB
            try {
                const res = await axios.get(`http://localhost:5001/code/${roomId}`);
                const initialCode = res.data.code || "";
                editor.setValue(initialCode); // Load code into the editor
                setIsCodeLoaded(true);
            } catch (err) {
                console.error("Failed to load code:", err);
            }

            // Handle code changes
            editorRef.current.on("change", (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);

                if (origin !== 'setValue') {
                    socketRef.current.emit("code-change", { roomId, code });

                    // Save the code to MongoDB whenever a change is made
                    if (isCodeLoaded) { // Only save after initial load
                        axios.post(`http://localhost:5001/code/${roomId}`, { code })
                            .catch(err => console.error("Failed to save code:", err));
                    }
                }
            });
        };
        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on("code-change", ({ code }) => {
                if (code !== null && code !== editorRef.current.getValue()) {
                    editorRef.current.setValue(code);
                }
            });
        }
        return () => socketRef.current.off("code-change");
    }, [socketRef.current]);

    return (
        <div style={{ overflowY: "auto", height: "100%" }}>
            <textarea id="realTimeEditor"></textarea>
        </div>
    );
}

export default Editor;
