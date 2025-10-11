import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
    MessageCircle,
    Send,
    Loader2,
    X,
    AlertTriangle,
    Database,
    MessageSquare,
    List,
    Archive,
    CheckCircle,
    Clock,
    User,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged,
    signInWithCustomToken,
} from "firebase/auth";
import {
    getFirestore,
    collection,
    query,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    orderBy,
    setDoc,
} from "firebase/firestore";
import ReactMarkdown from "react-markdown";

// --- CONFIGURACIÓN DE FIREBASE (Uso de variables globales de Canvas) ---
const firebaseConfig =
    typeof __firebase_config !== "undefined"
        ? JSON.parse(__firebase_config)
        : {};
const initialAuthToken =
    typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;
const MASTER_APP_ID =
    typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// --- CONSTANTES ---
const ANONYMOUS_USER_ID_KEY = "chatbot_anon_id";
const LOCAL_CHAT_KEY = "chatbot_local_history_";

// --- INICIALIZACIÓN DE FIREBASE COMO SINGLETON ---
const firebaseInstances = {
    app: null,
    db: null,
    auth: null,
};

const initializeFirebase = () => {
    // Si la configuración de Firebase está vacía, no inicializamos Firebase.
    if (Object.keys(firebaseConfig).length === 0) {
        return { app: null, db: null, auth: null };
    }

    if (firebaseInstances.app) {
        return firebaseInstances;
    }

    try {
        firebaseInstances.app = initializeApp(firebaseConfig);
        firebaseInstances.db = getFirestore(firebaseInstances.app);
        firebaseInstances.auth = getAuth(firebaseInstances.app);
    } catch (error) {
        console.error(
            "Error al inicializar Firebase. Cayendo a LocalStorage:",
            error
        );
        return { app: null, db: null, auth: null };
    }
    return firebaseInstances;
};

const { db, auth } = initializeFirebase();
const IS_FIREBASE_CONFIGURED = !!db;

// --- HOOK PERSONALIZADO: useChatbot ---
const useChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState("chat");
    const [messages, setMessages] = useState([]);
    const [artifacts, setArtifacts] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
    const [userId, setUserId] = useState(null); // ID del usuario, puede ser Firebase UID o ID anónimo local
    const [isLoggedIn, setIsLoggedIn] = useState(false); // True si es un usuario de Canvas o Firebase
    const [isAuthReady, setIsAuthReady] = useState(false);

    const messagesEndRef = useRef(null);

    /**
     * Gestión del ID Anónimo Persistente.
     * Genera o recupera un ID único para usuarios sin Firebase o sin sesión.
     */
    const getOrCreateAnonId = () => {
        let anonId = localStorage.getItem(ANONYMOUS_USER_ID_KEY);
        if (!anonId) {
            anonId = crypto.randomUUID();
            localStorage.setItem(ANONYMOUS_USER_ID_KEY, anonId);
        }
        return `anon-${anonId}`; // Prefijo para distinguirlo de los UIDs de Firebase
    };

    /**
     * Carga el historial de chat desde localStorage (solo para usuarios anónimos).
     */
    const loadLocalChat = (anonId) => {
        try {
            const history = localStorage.getItem(LOCAL_CHAT_KEY + anonId);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error("Error cargando chat local:", error);
            return [];
        }
    };

    /**
     * Guarda el historial de chat en localStorage (solo para usuarios anónimos).
     */
    const saveLocalChat = (anonId, currentMessages) => {
        try {
            localStorage.setItem(
                LOCAL_CHAT_KEY + anonId,
                JSON.stringify(currentMessages)
            );
        } catch (error) {
            console.error("Error guardando chat local:", error);
        }
    };

    // EFECTO 1: Gestión de la autenticación y el userId
    useEffect(() => {
        if (!IS_FIREBASE_CONFIGURED || !auth) {
            // Modo LocalStorage/Anónimo: Usar ID persistente del navegador.
            const anonId = getOrCreateAnonId();
            setUserId(anonId);
            setIsLoggedIn(false);
            setMessages(loadLocalChat(anonId));
            setIsAuthReady(true);
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
                console.error(
                    "Error signing in with Firebase. Falling back to anon ID:",
                    error
                );
                const anonId = getOrCreateAnonId();
                setUserId(anonId);
                setIsLoggedIn(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                // Usuario autenticado (ej. via Custom Token)
                setUserId(user.uid);
                setIsLoggedIn(true);
            } else if (user && user.isAnonymous) {
                // Usuario anónimo de Firebase (si no hay Custom Token)
                setUserId(user.uid);
                setIsLoggedIn(false); // Considerado no 'logeado' en el sentido de una cuenta
            } else {
                // Error de autenticación/Logout, caer a ID persistente local
                const anonId = getOrCreateAnonId();
                setUserId(anonId);
                setIsLoggedIn(false);
            }
            setIsAuthReady(true);
        });

        setupAuth();
        return () => unsubscribe();
    }, []);

    // EFECTO 2: Suscripción a mensajes de chat (Firebase) o guardado (Local)
    useEffect(() => {
        const currentUserId = userId;
        if (!isAuthReady || !currentUserId) return;

        // Caso 1: Usuario con persistencia en Firebase (Autenticado o Anónimo de Firebase)
        if (
            IS_FIREBASE_CONFIGURED &&
            db &&
            currentUserId &&
            !currentUserId.startsWith("anon-")
        ) {
            const chatRef = collection(
                db,
                "artifacts",
                MASTER_APP_ID,
                "users",
                currentUserId,
                "chat_messages"
            );
            const q = query(chatRef, orderBy("createdAt", "asc"));

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const fetchedMessages = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            role: data.role,
                            text: data.text,
                            createdAt: data.createdAt?.toDate
                                ? data.createdAt.toDate()
                                : new Date(),
                        };
                    });
                    setMessages(fetchedMessages);
                },
                (error) => {
                    console.error(
                        "Error al escuchar mensajes de Firestore:",
                        error
                    );
                }
            );
            return () => unsubscribe();
        }

        // Caso 2: Usuario Anónimo Local (Persistencia en localStorage)
        else if (currentUserId.startsWith("anon-")) {
            // Ya se cargó en el efecto inicial. Ahora solo se guarda al enviar.
            // No hay suscripción en este caso, el estado 'messages' se actualiza localmente.
        }
    }, [isAuthReady, userId]);

    // EFECTO 3: Suscripción de Artefactos (Público, solo si Firebase está configurado)
    useEffect(() => {
        if (!IS_FIREBASE_CONFIGURED || !db || !isAuthReady) return;

        const artifactsRef = collection(
            db,
            `artifacts/${MASTER_APP_ID}/public/data/user_artifacts`
        );
        const q = query(artifactsRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedArtifacts = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || "Artefacto sin título",
                        type: data.type || "Nota",
                        content: data.content,
                        userId: data.userId,
                        createdAt: data.createdAt?.toDate
                            ? data.createdAt.toDate()
                            : new Date(),
                    };
                });
                setArtifacts(fetchedArtifacts);
            },
            (error) => {
                console.error(
                    "Error al escuchar artefactos de Firestore:",
                    error
                );
            }
        );
        return () => unsubscribe();
    }, [isAuthReady]);

    // --- FUNCIONES UTILITARIAS ---

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading, isOpen, apiError]);

    // Función para llamar al backend para guardar artefactos
    const saveArtifact = async (latestUserMessage, currentUserId) => {
        if (!latestUserMessage || !currentUserId) return;
        try {
            await axios.post("/api/chatbot/extract-and-save-artifact", {
                userId: currentUserId,
                latestUserMessage: latestUserMessage,
            });
        } catch (error) {
            console.error(
                "Error al intentar guardar artefactos en el backend:",
                error
            );
        }
    };

    // Función para manejar el envío y la persistencia
    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading || isRateLimited || !userId) {
            return;
        }

        setApiError(null);
        setIsLoading(true);
        const userText = inputMessage.trim();
        setInputMessage("");

        const isLocalUser = userId.startsWith("anon-");

        // Mensaje de usuario a guardar local o en Firebase
        const userMessage = {
            role: "user",
            text: userText,
            createdAt: new Date(),
        };

        let messageHistorySnapshot = [...messages];

        try {
            // 1. Persistencia del mensaje de usuario
            if (isLocalUser) {
                // Guardado local y actualización inmediata del estado
                messageHistorySnapshot.push(userMessage);
                setMessages(messageHistorySnapshot);
                saveLocalChat(userId, messageHistorySnapshot);
            } else {
                // Persistencia en Firebase (el onSnapshot actualizará el estado)
                const chatRef = collection(
                    db,
                    "artifacts",
                    MASTER_APP_ID,
                    "users",
                    userId,
                    "chat_messages"
                );
                await addDoc(chatRef, {
                    ...userMessage,
                    createdAt: serverTimestamp(),
                });
                // NOTA: No necesitamos actualizar 'messages' aquí, el 'onSnapshot' lo hará.
                // Usamos el 'messages' actual para el historial de la API.
            }

            // 2. Preparar el historial para la API
            const historyForApi = messages
                .filter((m) => m.text && m.text.trim())
                .map((m) => ({ role: m.role, text: m.text }));

            // Si es un usuario de Firebase, el mensaje de usuario ya se añadió a 'messages' por 'onSnapshot'.
            // Si es un usuario local, ya se añadió en el snapshot local.
            historyForApi.push({ role: "user", text: userText });

            const response = await axios.post("/api/chatbot/message", {
                userId: userId, // Usar el userId para la API
                history: historyForApi,
            });

            const botMessageText = response.data.message;
            const botMessage = {
                role: "model",
                text: botMessageText,
                createdAt: new Date(),
            };

            // 3. Persistencia de la respuesta del bot
            if (isLocalUser) {
                // Guardado local y actualización inmediata del estado
                messageHistorySnapshot.push(botMessage);
                setMessages([...messageHistorySnapshot]); // Forzar re-renderizado
                saveLocalChat(userId, messageHistorySnapshot);
            } else {
                // Persistencia en Firebase
                const chatRef = collection(
                    db,
                    "artifacts",
                    MASTER_APP_ID,
                    "users",
                    userId,
                    "chat_messages"
                );
                await addDoc(chatRef, {
                    ...botMessage,
                    createdAt: serverTimestamp(),
                });
            }

            // 4. Llamar a la extracción de artefactos (independiente de la respuesta del bot)
            if (IS_FIREBASE_CONFIGURED && db) {
                await saveArtifact(userText, userId);
            }
        } catch (error) {
            // En la función handleSend, dentro del bloque catch (alrededor de la línea 402)

            console.error("Error durante el proceso de chat:", error);
            if (error.response?.status === 429) {
                // ... (Lógica existente para 429 Rate Limit)
                const retryAfter = error.response.headers["Retry-After"] || 60;
                const waitTime = parseInt(retryAfter, 10);
                setRetryAfterSeconds(waitTime);
                setIsRateLimited(true);
                setApiError(
                    `Has excedido el límite de mensajes. Por favor, espera ${waitTime} segundos.`
                );
                // 🚨 AÑADE ESTE BLOQUE 🚨
            } else if (error.response?.status === 403) {
                setApiError(
                    "Error de seguridad: Tu ID de sesión no coincide con tu usuario autenticado. Recarga la página."
                );
                // 🚨 FIN DEL BLOQUE AÑADIDO 🚨
            } else {
                setApiError(
                    `Error de comunicación (${
                        error.response?.status || "network"
                    }). Maider no pudo responder.`
                );
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
        apiError,
        isRateLimited,
        retryAfterSeconds,
        handleSend,
        messagesEndRef,
        userId,
        isLoggedIn,
        isAuthReady,
        IS_FIREBASE_CONFIGURED,
        isLocalUser: userId?.startsWith("anon-") || !IS_FIREBASE_CONFIGURED,
    };
};

// --- COMPONENTES AUXILIARES (Sin cambios significativos en lógica, solo props) ---

const Message = ({ message }) => {
    const isUser = message.role === "user";
    const alignment = isUser ? "self-end" : "self-start";
    const bgColor = isUser
        ? "bg-indigo-600 text-white"
        : "bg-white text-gray-800 border border-gray-100";

    return (
        <div
            className={`max-w-[85%] rounded-xl shadow-sm p-3 my-2 transition duration-200 ease-in-out ${alignment} ${bgColor}`}
        >
            <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
    );
};

const TypingIndicator = () => (
    <div className="max-w-[85%] self-start bg-white text-gray-800 rounded-xl shadow-sm p-3 my-1 flex items-center border border-gray-100">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-indigo-500" />
        <span>Maider está pensando...</span>
    </div>
);

const ArtifactItem = ({ artifact, currentUserId }) => {
    const isCurrentUser = artifact.userId === currentUserId;
    // Los artefactos solo se guardan si Firebase está configurado.

    return (
        <div
            className={`p-4 rounded-lg border-l-4 ${
                isCurrentUser
                    ? "border-green-500 bg-white"
                    : "border-gray-300 bg-gray-100"
            } shadow-sm mb-3 transition hover:shadow-md`}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-gray-800">
                    {artifact.title}
                </h4>
                <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        artifact.type === "Recomendación"
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-200 text-gray-600"
                    }`}
                >
                    {artifact.type}
                </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{artifact.content}</p>
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400 truncate max-w-[50%]">
                    Usuario ID: {artifact.userId}
                </p>
                <p className="text-xs text-gray-400">
                    Guardado:{" "}
                    {new Date(artifact.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

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
        apiError,
        isRateLimited,
        retryAfterSeconds,
        handleSend,
        messagesEndRef,
        userId,
        isLoggedIn,
        isAuthReady,
        IS_FIREBASE_CONFIGURED,
        isLocalUser,
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

    // Pantalla de carga mientras se conecta la autenticación de Firebase
    if (IS_FIREBASE_CONFIGURED && !isAuthReady) {
        return (
            <div className="fixed bottom-6 right-6 w-full max-w-sm h-[80vh] sm:h-[600px] flex flex-col justify-center items-center bg-gray-50 rounded-xl shadow-2xl z-50 p-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <p className="mt-4 text-gray-600">
                    Conectando servicio de autenticación...
                </p>
            </div>
        );
    }

    const renderContent = () => {
        if (view === "artifacts") {
            if (!IS_FIREBASE_CONFIGURED) {
                return (
                    <div className="p-4 text-center text-gray-500 mt-20">
                        <Archive className="h-10 w-10 mx-auto mb-3 text-red-400" />
                        <p className="font-bold">Artefactos no disponibles</p>
                        <p className="text-sm mt-2">
                            La función de Artefactos requiere que la
                            configuración de Firebase esté disponible.
                        </p>
                    </div>
                );
            }
            return (
                <div className="p-4 overflow-y-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Archive className="h-5 w-5 mr-2 text-indigo-500" />
                        Artefactos de Conversación (Compartidos)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Aquí se guardan las **notas o recomendaciones clave**
                        extraídas del chat.
                    </p>
                    {artifacts.length === 0 && (
                        <div className="text-center p-8 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                            No hay artefactos guardados aún.
                        </div>
                    )}
                    {artifacts.map((artifact) => (
                        <ArtifactItem
                            key={artifact.id}
                            artifact={artifact}
                            currentUserId={userId}
                        />
                    ))}
                </div>
            );
        }

        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {/* Alerta de Error de API */}
                {apiError && !isRateLimited && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center shadow-md animate-pulse">
                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{apiError}</span>
                    </div>
                )}
                {/* Alerta de Límite de Tasa */}
                {isRateLimited && (
                    <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg flex items-center shadow-md">
                        <Clock className="h-5 w-5 mr-2 flex-shrink-0 animate-spin" />
                        <span className="text-sm font-medium">
                            Límite excedido. Reintento en **{retryAfterSeconds}
                            ** segundos.
                        </span>
                    </div>
                )}
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20 p-4 bg-white rounded-lg shadow-inner">
                        <MessageCircle className="h-10 w-10 mx-auto mb-3 text-indigo-500" />
                        <p className="font-bold text-lg text-gray-700">
                            ¡Hola! Soy Maider.
                        </p>
                        <p className="text-sm mt-2">
                            {isLocalUser
                                ? "Tu conversación se guarda en tu navegador y se perderá al borrar el caché."
                                : "Tu conversación se guarda permanentemente en la nube de Firebase."}
                        </p>
                        <p
                            className={`text-xs mt-3 font-semibold flex items-center justify-center ${
                                isLocalUser ? "text-red-500" : "text-green-600"
                            }`}
                        >
                            <Database className="h-3 w-3 mr-1" />
                            {isLocalUser
                                ? "Persistencia: Local/Temporal"
                                : "Persistencia: Firebase Cloud"}
                        </p>
                        {userId && (
                            <p className="text-xs mt-3 text-gray-400 truncate">
                                ID de Sesión: {userId}
                            </p>
                        )}
                    </div>
                )}
                {messages.map((msg, index) => (
                    <Message key={msg.id || index} message={msg} />
                ))}
                {/* Indicador de que el bot está respondiendo */}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 w-full max-w-sm h-[80vh] sm:h-[600px] flex flex-col bg-gray-50 rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-300 transition-all duration-300">
            {/* Encabezado y Pestañas */}
            <div className="bg-indigo-600 text-white shadow-md border-b border-indigo-700">
                <div className="flex justify-between items-center p-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <User
                            className={`h-5 w-5 mr-2 ${
                                isLoggedIn
                                    ? "text-green-300"
                                    : "text-yellow-300"
                            }`}
                        />
                        Asistente Maider (
                        {isLoggedIn ? "Registrado" : "Anónimo"})
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
                        onClick={() => setView("chat")}
                        className={`flex-1 flex justify-center items-center py-2 transition duration-200 ${
                            view === "chat"
                                ? "bg-indigo-700"
                                : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                    >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Chat
                    </button>
                    <button
                        onClick={() => setView("artifacts")}
                        className={`flex-1 flex justify-center items-center py-2 transition duration-200 ${
                            view === "artifacts"
                                ? "bg-indigo-700"
                                : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                        disabled={!IS_FIREBASE_CONFIGURED}
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
            {view === "chat" && (
                <form
                    onSubmit={handleSend}
                    className="p-4 bg-white border-t border-gray-200"
                >
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={
                                isRateLimited
                                    ? `Espera ${retryAfterSeconds} segundos...(máximo 10 mensaje por minuto) `
                                    : "Escribe tu mensaje..."
                            }
                            className="flex-1 p-3 border border-gray-200 rounded-xl shadow-inner focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            disabled={isLoading || isRateLimited}
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className={`p-3 rounded-xl transition duration-200 transform ${
                                isLoading ||
                                isRateLimited ||
                                !inputMessage.trim()
                                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]"
                            }`}
                            disabled={
                                isLoading ||
                                isRateLimited ||
                                !inputMessage.trim()
                            }
                            aria-label="Enviar Mensaje"
                        >
                            {isLoading ? (
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
