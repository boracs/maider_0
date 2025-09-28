import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MessageCircle, Send, Loader2, X, AlertTriangle, Database, MessageSquare, List, Archive, CheckCircle, Clock } from 'lucide-react';


// Firebase SDK (Modular)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// Librerías de Markdown para renderizar texto enriquecido del bot
import ReactMarkdown from 'react-markdown';

// --- CONFIGURACIÓN DE FIREBASE (Fuera del hook) ---
// Variables globales proporcionadas por el entorno de Canvas
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, db, auth;
if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} else {
    // Si Firebase no está configurado, la persistencia no funcionará,
    // pero el chatbot NO debe bloquearse.
    console.error("Firebase no está configurado. La persistencia de datos no funcionará.");
}

// --- HOOK PERSONALIZADO: useChatbot (Contiene toda la lógica de estado, API y Firestore) ---
const useChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('chat'); // Nuevo estado: 'chat' o 'artifacts'
    const [messages, setMessages] = useState([]); 
    const [artifacts, setArtifacts] = useState([]); // Nuevo estado para los artefactos extraídos
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false); // Estado para la extracción estructurada
    const [apiError, setApiError] = useState(null); 
    const [isRateLimited, setIsRateLimited] = useState(false); // NUEVO: Estado para el límite de tasa
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(0); // NUEVO: Tiempo de espera
    const [userId, setUserId] = useState(null); 
    const [isAuthReady, setIsAuthReady] = useState(!!auth && Object.keys(firebaseConfig).length > 0 ? false : true); 
    const messagesEndRef = useRef(null);
    
    // Ruta de la colección de chat (Datos privados del usuario)
    const getChatCollectionRef = (uid) => {
        if (!db || !uid) return null;
        // Colección privada: /artifacts/{appId}/users/{userId}/chat_messages
        return collection(db, `artifacts/${appId}/users/${uid}/chat_messages`);
    };

    // Ruta de la colección de artefactos extraídos (Datos públicos/consultables)
    const getArtifactsCollectionRef = () => {
        if (!db) return null;
        // Colección pública: /artifacts/{appId}/public/data/user_artifacts
        return collection(db, `artifacts/${appId}/public/data/user_artifacts`);
    };

    // Función para desplazarse al final de los mensajes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Efecto 1: Desplazamiento y limpieza de errores
    useEffect(() => {
        scrollToBottom();
        if (apiError && messages.length > 0 && messages[messages.length - 1].role === 'user') {
            setApiError(null);
        }
    }, [messages, isLoading, isOpen, apiError]);

    // Efecto 2: Atajo de teclado (Escape para cerrar)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (isOpen && event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // EFECTO 3: Inicialización de Firebase Auth
    useEffect(() => {
        if (!auth) {
            return; 
        }

        const setupAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Error signing in with Firebase:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(crypto.randomUUID()); 
            }
            setIsAuthReady(true);
        });

        setupAuth();
        return () => unsubscribe();
    }, []);

    // EFECTO 4: Carga de Mensajes de Chat (Privado)
    useEffect(() => {
        if (!isAuthReady || !userId || !db) return; 

        const chatRef = getChatCollectionRef(userId);
        const q = query(chatRef); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        role: data.role,
                        text: data.text,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    };
                })
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); 

            setMessages(fetchedMessages);
        }, (error) => {
            console.error("Error al escuchar mensajes de Firestore:", error);
        });

        return () => unsubscribe();
    }, [isAuthReady, userId]); 

    // EFECTO 5: Carga de Artefactos (Público, para búsqueda)
    useEffect(() => {
        if (!isAuthReady || !db) return;

        const artifactsRef = getArtifactsCollectionRef();
        const q = query(artifactsRef); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedArtifacts = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || 'Artefacto sin título',
                        type: data.type || 'Nota',
                        content: data.content,
                        userId: data.userId, 
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    };
                })
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); 

            setArtifacts(fetchedArtifacts);
        }, (error) => {
            console.error("Error al escuchar artefactos de Firestore:", error);
        });

        return () => unsubscribe();
    }, [isAuthReady]); 

    // EFECTO 6: Manejo del temporizador de límite de tasa (NUEVO)
    useEffect(() => {
        let timer;
        if (isRateLimited && retryAfterSeconds > 0) {
            timer = setInterval(() => {
                setRetryAfterSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsRateLimited(false);
                        setApiError(null); // Limpiamos el error después de la espera
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (isRateLimited && retryAfterSeconds === 0) {
            setIsRateLimited(false);
            setApiError(null);
        }

        return () => clearInterval(timer);
    }, [isRateLimited, retryAfterSeconds]);

    // SIMULACIÓN: Función para simular la extracción y el guardado estructurado
    const saveArtifact = async (botResponse, currentUserId) => {
        setIsExtracting(true);
        if (!db || !currentUserId) {
            setIsExtracting(false);
            return;
        }

        try {
            // ... (Lógica de simulación de extracción)
            if (botResponse.toLowerCase().includes("recomiendo el restaurante")) {
                const artifactData = {
                    title: "Recomendación de Restaurante",
                    type: "Recomendación",
                    content: "Se recomendó 'El Tenedor Feliz' en Madrid. Revisar horario y menú.",
                };

                const artifactsRef = getArtifactsCollectionRef();
                if (!artifactsRef) throw new Error("Referencia de Artefactos no disponible.");

                await addDoc(artifactsRef, {
                    ...artifactData,
                    userId: currentUserId,
                    createdAt: serverTimestamp(),
                });
                console.log("Artefacto de conversación guardado exitosamente.");
            }
            // FIN DE SIMULACIÓN

        } catch (error) {
            console.error('Error al extraer o guardar artefacto:', error);
        } finally {
            setIsExtracting(false);
        }
    };


    // Función principal para enviar el mensaje al backend y a Firestore
    const handleSend = async (e) => {
        e.preventDefault();
        // AÑADIDO: No enviar si está rate limited
        if (!inputMessage.trim() || isLoading || isExtracting || isRateLimited) { 
            return;
        }

        setApiError(null);
        setIsLoading(true);
        const userText = inputMessage.trim();
        setInputMessage('');

        // 1. Guardar mensaje del usuario en Firestore (Privado)
        let isSavedToFirestore = false;
        try {
            
            if (db && userId) { 
                const chatRef = getChatCollectionRef(userId);
                if (!chatRef) throw new Error("Referencia de Firestore no disponible.");

                await addDoc(chatRef, {
                    role: 'user',
                    text: userText,
                    createdAt: serverTimestamp(),
                });
                isSavedToFirestore = true;
            } else {
                setMessages(prev => [...prev, { role: 'user', text: userText, createdAt: new Date() }]);
            }

            // 2. Enviar el historial completo al controlador de Laravel para obtener respuesta del LLM
            const historyForApi = [...messages, { role: 'user', text: userText }]; 
            const response = await axios.post('/api/chatbot/message', {
                history: historyForApi,
            });

            const botMessageText = response.data.message;
            
            // 3. Guardar la respuesta del bot en Firestore (Privado) o añadirla localmente
            if (isSavedToFirestore) {
                const chatRef = getChatCollectionRef(userId);
                 if (!chatRef) throw new Error("Referencia de Firestore no disponible para bot.");

                await addDoc(chatRef, {
                    role: 'model',
                    text: botMessageText,
                    createdAt: serverTimestamp(),
                });
            } else {
                setMessages(prev => [...prev, { role: 'model', text: botMessageText, createdAt: new Date() }]);
            }
            
            // 4. Intentar extraer y guardar el artefacto estructurado
            await saveArtifact(botMessageText, userId);


        } catch (error) {
            console.error('Error durante el proceso de chat:', error);

            // --- NUEVA LÓGICA DE LÍMITE DE TASA (429) ---
            if (error.response && error.response.status === 429) {
                // El backend de Laravel debería devolver 429. Intentamos leer el header 'Retry-After'.
                // Si no existe, usamos un valor por defecto (60 segundos).
                const retryAfter = error.response.headers['Retry-After'] || 60; 
                const waitTime = parseInt(retryAfter, 10);
                
                setRetryAfterSeconds(waitTime);
                setIsRateLimited(true);
                // Usamos apiError para mostrar el mensaje de límite excedido en el chat
                setApiError(`Has excedido el límite de mensajes. Por favor, espera ${waitTime} segundos.`);
            } else {
                // Error de conexión general
                setApiError('Error de conexión. Maider no pudo responder. Inténtalo de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isOpen, 
        setIsOpen, 
        view, 
        setView,
        messages, 
        artifacts,
        inputMessage, 
        setInputMessage, 
        isLoading, 
        isExtracting,
        apiError, 
        isRateLimited, // NUEVO
        retryAfterSeconds, // NUEVO
        handleSend, 
        messagesEndRef,
        userId, 
        isAuthReady,
    };
};
// --- FIN DEL HOOK ---

// --- COMPONENTES AUXILIARES ---

const Message = ({ message }) => {
    const isUser = message.role === 'user';
    const alignment = isUser ? 'self-end' : 'self-start';
    const bgColor = isUser ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-100';
    
    return (
        <div className={`max-w-[85%] rounded-xl shadow-sm p-3 my-2 transition duration-200 ease-in-out ${alignment} ${bgColor}`}>
            <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
    );
};

const TypingIndicator = ({ isExtracting }) => (
    <div className="max-w-[85%] self-start bg-white text-gray-800 rounded-xl shadow-sm p-3 my-1 flex items-center border border-gray-100">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-indigo-500" />
        <span>{isExtracting ? 'Clasificando datos...' : 'Maider está escribiendo...'}</span> 
    </div>
);

const ArtifactItem = ({ artifact }) => {
    const isCurrentUser = auth && auth.currentUser 
        ? artifact.userId === auth.currentUser.uid 
        : true; 

    return (
        <div className={`p-4 rounded-lg border-l-4 ${isCurrentUser ? 'border-green-500 bg-white' : 'border-gray-300 bg-gray-100'} shadow-sm mb-3 transition hover:shadow-md`}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-gray-800">{artifact.title}</h4>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${artifact.type === 'Recomendación' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'}`}>
                    {artifact.type}
                </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{artifact.content}</p>
            <p className="text-xs text-gray-400 mt-2 text-right">
                Guardado: {new Date(artifact.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (Solo Renderizado) ---
const Chatbot = () => {
    const { 
        isOpen, 
        setIsOpen, 
        view, 
        setView,
        messages, 
        artifacts,
        inputMessage, 
        setInputMessage, 
        isLoading, 
        isExtracting,
        apiError, 
        isRateLimited, // NUEVO
        retryAfterSeconds, // NUEVO
        handleSend, 
        messagesEndRef,
        userId, 
        isAuthReady,
    } = useChatbot();

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-110 z-50"
                aria-label="Abrir Chatbot"
            >
                <MessageCircle className="h-7 w-7" />
            </button>
        );
    }

    if (Object.keys(firebaseConfig).length > 0 && !isAuthReady) {
        return (
            <div className="fixed bottom-6 right-6 w-full max-w-sm h-[80vh] sm:h-[600px] flex flex-col justify-center items-center bg-gray-50 rounded-xl shadow-2xl z-50 p-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <p className="mt-4 text-gray-600">Conectando a la base de datos...</p>
            </div>
        );
    }

    // Contenido dinámico del área de mensajes/artefactos
    const renderContent = () => {
        if (view === 'artifacts') {
            return (
                <div className="p-4 overflow-y-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Archive className="h-5 w-5 mr-2 text-indigo-500" />
                        Artefactos de Conversación
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Aquí se guardan automáticamente las **reservas, notas o recomendaciones clave** extraídas del chat para que puedas consultarlas fácilmente.
                    </p>
                    {artifacts.length === 0 && (
                        <div className="text-center p-8 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                            No hay artefactos guardados aún.
                        </div>
                    )}
                    {artifacts.map(artifact => (
                        <ArtifactItem key={artifact.id} artifact={artifact} />
                    ))}
                </div>
            );
        }

        // Vista 'chat'
        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                
                {/* Alerta de Error General de API */}
                {apiError && !isRateLimited && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center shadow-md animate-pulse">
                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{apiError}</span>
                    </div>
                )}

                {/* NUEVO: Alerta de Límite de Tasa */}
                {isRateLimited && (
                    <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg flex items-center shadow-md">
                        <Clock className="h-5 w-5 mr-2 flex-shrink-0 animate-pulse" />
                        <span className="text-sm font-medium">
                            Límite excedido. Reintento en **{retryAfterSeconds}** segundos.
                        </span>
                    </div>
                )}


                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20 p-4 bg-white rounded-lg shadow-inner">
                        <MessageCircle className="h-10 w-10 mx-auto mb-3 text-indigo-500" />
                        <p className="font-bold text-lg text-gray-700">¡Hola! Soy Maider, tu Asistente Personal.</p>
                        <p className="text-sm mt-2">
                            Tu chat está conectado a la **nube** (Firestore {userId ? "✅" : "❌"}). 
                        </p>
                        {userId && <p className="text-xs mt-3 text-gray-400 truncate">ID de Sesión: {userId}</p>}
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}

                {/* Indicador de que el bot está respondiendo o extrayendo */}
                {(isLoading || isExtracting) && <TypingIndicator isExtracting={isExtracting} />}
                
                {isExtracting && !isLoading && (
                    // Este indicador se muestra solo si la extracción es exitosa pero la respuesta principal del bot ya terminó
                     <div className="max-w-[85%] self-start text-xs text-gray-500 mt-1 flex items-center">
                         <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                         Nota guardada. Revisar pestaña "Artefactos".
                     </div>
                )}


                <div ref={messagesEndRef} />
            </div>
        );
    };


    // Renderizado principal del Chatbot
    return (
        <div className="fixed bottom-6 right-6 w-full max-w-sm h-[80vh] sm:h-[600px] flex flex-col bg-gray-50 rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-300 transition-all duration-300">
            
            {/* Encabezado y Pestañas */}
            <div className="bg-indigo-600 text-white shadow-md border-b border-indigo-700">
                <div className="flex justify-between items-center p-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <Database className="h-5 w-5 mr-2" />
                        Asistente Maider 
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-full hover:bg-indigo-700 transition duration-150"
                        aria-label="Cerrar Chatbot"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                {/* Pestañas de Navegación */}
                <div className="flex border-t border-indigo-700">
                    <button
                        onClick={() => setView('chat')}
                        className={`flex-1 flex justify-center items-center py-2 transition duration-200 ${
                            view === 'chat' ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                    >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Chat
                    </button>
                    <button
                        onClick={() => setView('artifacts')}
                        className={`flex-1 flex justify-center items-center py-2 transition duration-200 ${
                            view === 'artifacts' ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                    >
                        <List className="h-5 w-5 mr-2" />
                        Artefactos ({artifacts.length})
                    </button>
                </div>
            </div>

            {/* Área de Contenido */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                {renderContent()}
            </div>

            {/* Formulario de Entrada (Solo visible en vista 'chat') */}
            {view === 'chat' && (
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={isRateLimited ? `Espera ${retryAfterSeconds} seg...(max 10/minuto) ` : "Escribe tu mensaje..."}
                            className="flex-1 p-3 border border-gray-200 rounded-xl shadow-inner focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            disabled={isLoading || isExtracting || isRateLimited} // DESHABILITADO por Rate Limit
                            autoComplete="off" 
                        />
                        <button
                            type="submit"
                            className={`p-3 rounded-xl transition duration-200 transform ${
                                (isLoading || isExtracting || isRateLimited || !inputMessage.trim()) // DESHABILITADO por Rate Limit
                                ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]'
                            }`}
                            disabled={isLoading || isExtracting || isRateLimited || !inputMessage.trim()}
                            aria-label="Enviar Mensaje"
                        >
                            {isLoading || isExtracting ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <Send className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Chatbot;
