// import { useEffect, useRef } from 'react';
// import axios from 'axios';
// import { convertHtmlToJson } from './convertions/HtmltoJson';
// import { convertJsontoHtml } from './convertions/JsontoHtml';


// const CustomTinyMceCollab = () => {
//     const editorRef = useRef(null);
//     const wsRef = useRef(null);
//     const editorId = 'tiny-editor';

//     useEffect(() => {
//         const userId = useRef("User_" + Math.floor(Math.random() * 10000));
//         const loadTinyMCEScript = () => {
//             return new Promise((resolve) => {
//                 if (window.tinymce) {
//                     resolve();
//                     return;
//                 }
//                 const script = document.createElement('script');
//                 script.src = 'tinymce/js/tinymce/tinymce.min.js';
//                 script.onload = () => resolve();
//                 document.body.appendChild(script);
//             });
//         };

//         let editorInstance = null;

//         const initEditor = (content) => {
//             window.tinymce.init({
//                 selector: `#${editorId}`,
//                 height: 600,
//                 menubar: true,
//                 plugins: 'table lists advlist code image emoticons charmap insertdatetime media preview quickbars searchreplace',
//                 toolbar:
//                     'undo redo | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | table | print emoticons charmap insertdatetime image media preview save searchreplace',
//                 setup: (editor) => {
//                     editorInstance = editor;
//                     editorRef.current = editor;

//                     editor.on('init', () => {
//                         editor.setContent(content);
//                     });

//                     editor.on('Change KeyUp', () => {
//                         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//                             const htmlContent = editor.getContent();
//                             const jsonContent = convertHtmlToJson(htmlContent, true);
//                             const bookmark = editor.selection.getBookmark(2, true);

//                             const message = {
//                                 type: 'content_update',
//                                 content: jsonContent,
//                                 cursor: bookmark,
//                                 timestamp: Date.now().toString(),
//                                 client_id: userId.current

//                             };

//                             wsRef.current.send(JSON.stringify(message));
//                         }
//                     });
//                 },
//             });
//         };

//         const fetchAndInit = async () => {
//             await loadTinyMCEScript();

//             try {
//                 const res = await axios.get('https://8f89c53c-7e8c-458b-8561-33386c680c73-00-yg7ctkxthwa6.picard.replit.dev/document');
//                 // const res = await axios.get('https://3ed10fa9-5099-4221-a618-744c43047476-00-n8mnnnl2ojn9.riker.replit.dev:5000/document');
//                 // const res = await axios.get('http://127.0.0.1:809/document');
//                 console.log(res.data, 'res.data')
//                 const htmlContent = convertJsontoHtml(res.data);
//                 initEditor(htmlContent);
//             } catch (err) {
//                 console.error('Failed to fetch document or initialize editor', err);
//                 initEditor('');
//             }
//         };

//         fetchAndInit();
//         const ws = new WebSocket('wss://8f89c53c-7e8c-458b-8561-33386c680c73-00-yg7ctkxthwa6.picard.replit.dev/ws');
//         // const ws = new WebSocket('wss://3ed10fa9-5099-4221-a618-744c43047476-00-n8mnnnl2ojn9.riker.replit.dev:5000/ws');
//         // const ws = new WebSocket('ws://127.0.0.1:809/ws');
//         wsRef.current = ws;

//         ws.onmessage = (event) => {
//             try {
//                 const message = JSON.parse(event.data);
//                 if (message.type === 'content_update') {
//                     const jsonContent = message.content;
//                     const html = convertJsontoHtml(jsonContent);

//                     if (editorRef.current) {
//                         const editor = editorRef.current;
//                         const bookmark = editor.selection.getBookmark(2, true);

//                         const currentContent = editor.getContent();
//                         if (currentContent !== html) {
//                             editor.setContent(html);
//                             editor.focus();
//                             editor.selection.moveToBookmark(bookmark);
//                         }
//                     }
//                 }
//             } catch (err) {
//                 console.error('Invalid WebSocket message:', event.data, err);
//             }
//         };

//         return () => {
//             ws.close();
//             if (window.tinymce && editorInstance) {
//                 window.tinymce.remove(editorInstance);
//             }
//         };
//     }, [editorId]);

//     return (
//         <div style={{ width: "100%" }}>
//             <h2>Collaborative TinyMCE Editor</h2>
//             <div id={editorId}></div>
//             {/* <textarea style={{width:"100%"}} id={editorId}></textarea> */}
//         </div>
//     );
// };

// export default CustomTinyMceCollab;


import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { convertHtmlToJson } from './convertions/HtmltoJson';
import { convertJsontoHtml } from './convertions/JsontoHtml';

const CustomTinyMceCollab = () => {
    const editorRef = useRef(null);
    const wsRef = useRef(null);
    const editorId = 'tiny-editor';
    const containerRef = useRef(null);

    const userId = useRef('User_' + Math.floor(Math.random() * 10000));
    const [cursors, setCursors] = useState({});

    useEffect(() => {
        const loadTinyMCEScript = () => {
            return new Promise((resolve) => {
                if (window.tinymce) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = 'tinymce/js/tinymce/tinymce.min.js';
                script.onload = () => resolve();
                document.body.appendChild(script);
            });
        };

        let editorInstance = null;

        const initEditor = (content) => {
            window.tinymce.init({
                selector: `#${editorId}`,
                height: 600,
                menubar: true,
                plugins: 'table lists advlist code image emoticons charmap insertdatetime media preview quickbars searchreplace',
                toolbar:
                    'undo redo | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | table | print emoticons charmap insertdatetime image media preview save searchreplace',
                setup: (editor) => {
                    editorInstance = editor;
                    editorRef.current = editor;

                    editor.on('init', () => {
                        editor.setContent(content);
                    });

                    editor.on('Change KeyUp', () => {
                        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                            const htmlContent = editor.getContent();
                            const jsonContent = convertHtmlToJson(htmlContent, true);
                            const bookmark = editor.selection.getBookmark(2, true);

                            const message = {
                                type: 'content_update',
                                content: jsonContent,
                                cursor: bookmark,
                                timestamp: Date.now().toString(),
                                client_id: userId.current,
                            };

                            wsRef.current.send(JSON.stringify(message));
                        }
                    });
                },
            });
        };

        const fetchAndInit = async () => {
            await loadTinyMCEScript();
            try {
                // const res = await axios.get('https://8f89c53c-7e8c-458b-8561-33386c680c73-00-yg7ctkxthwa6.picard.replit.dev/document');
                const res = await axios.get('https://f94f27c7-944d-4a02-a95a-ee6af77e5f9f-00-17bll14izkd5r.spock.replit.dev/document');
                // const res = await axios.get('http://127.0.0.1:8092/document');
                const htmlContent = convertJsontoHtml(res.data);
                initEditor(htmlContent);
            } catch (err) {
                console.error('Failed to fetch document or initialize editor', err);
                initEditor('');
            }
        };

        fetchAndInit();
        // const ws = new WebSocket('wss://8f89c53c-7e8c-458b-8561-33386c680c73-00-yg7ctkxthwa6.picard.replit.dev/ws');
        const ws = new WebSocket('wss://f94f27c7-944d-4a02-a95a-ee6af77e5f9f-00-17bll14izkd5r.spock.replit.dev/ws');
    
        // const ws = new WebSocket('ws://127.0.0.1:8092/ws');
        // const ws = new WebSocket('wss://your-server-url/ws');
        wsRef.current = ws;

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'content_update') {
                    const jsonContent = message.content;
                    const html = convertJsontoHtml(jsonContent);

                    if (editorRef.current) {
                        const editor = editorRef.current;
                        const currentContent = editor.getContent();

                        if (currentContent !== html) {
                            const bookmark = editor.selection.getBookmark(2, true);
                            editor.setContent(html);
                            editor.selection.moveToBookmark(bookmark);
                        }

                        // Save other users' cursor
                        if (message.client_id !== userId.current && message.cursor) {
                            setCursors(prev => ({
                                ...prev,
                                [message.client_id]: {
                                    cursor: message.cursor,
                                    username: message.client_id
                                }
                            }));
                        }
                    }
                }
            } catch (err) {
                console.error('Invalid WebSocket message:', event.data, err);
            }
        };

        return () => {
            ws.close();
            if (window.tinymce && editorInstance) {
                window.tinymce.remove(editorInstance);
            }
        };
    }, [editorId]);

    // Renders user cursor overlays
    useEffect(() => {
        const renderCursors = () => {
            if (!editorRef.current) return;
            const editor = editorRef.current;
            const iframe = document.querySelector('iframe');
            if (!iframe) return;

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const body = iframeDoc.body;

            // Remove existing overlays
            iframeDoc.querySelectorAll('.cursor-label').forEach(el => el.remove());

            const currentBookmark = editor.selection.getBookmark(2, true);  // Save your current selection

            Object.entries(cursors).forEach(([clientId, { cursor, username }]) => {
                if (!cursor || !cursor.start) return;

                try {
                    // Move to bookmark temporarily to get range
                    editor.selection.moveToBookmark(cursor);
                    const rng = editor.selection.getRng();
                    const bounds = rng.getBoundingClientRect();

                    const label = iframeDoc.createElement('div');
                    label.textContent = username;
                    label.className = 'cursor-label';
                    Object.assign(label.style, {
                        position: 'absolute',
                        top: `${bounds.top - 20 + iframe.contentWindow.scrollY}px`,
                        left: `${bounds.left + iframe.contentWindow.scrollX}px`,
                        background: '#cfe9c4',
                        border: '1px solid #999',
                        padding: '2px 5px',
                        fontSize: '12px',
                        color: '#000',
                        zIndex: 9999,
                        borderRadius: '4px'
                    });

                    body.appendChild(label);
                } catch (err) {
                    console.error('Failed to render cursor for user:', username, err);
                }
            });

            // Restore your original selection
            editor.selection.moveToBookmark(currentBookmark);
        };

        const interval = setInterval(renderCursors, 500);

        return () => clearInterval(interval);
    }, [cursors]);


    return (
        <div className='text-area'>
            <h2 style={{textAlign:"center"}} >AI Verify Document Editor</h2>
            <textarea id={editorId} ></textarea>
        </div>
    );
};

export default CustomTinyMceCollab;
