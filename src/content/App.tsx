import React, { useState, useEffect, useRef } from 'react';
import { generateResponse, createSystemPrompt } from '../services/ai';
import { MessageSquare, X, Play, Brain, Lightbulb, Send, Settings, ChevronDown, Sun, Moon, RotateCcw, Maximize } from 'lucide-react';
import { motion, AnimatePresence, useDragControls, useMotionValue, useTransform, useSpring, useVelocity } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

const themes = {
    dark: {
        bg: '#1a1a1a', // Deep charcoal
        bgHeader: 'rgba(26, 26, 26, 0.95)', // Less transparent
        text: '#eff1f6',
        textSecondary: '#a1a1aa',
        border: 'rgba(255, 255, 255, 0.08)',
        inputBg: '#262626',
        cardBg: '#262626',
        codeBg: '#121212',
        accent: '#2cbb5d', // LeetCode Green
        userMsgBg: '#2cbb5d', // Solid LeetCode Green
        botMsgBg: '#262626',
        botMsgBorder: 'transparent',
        shadow: '0 10px 30px rgba(0, 0, 0, 0.5)', // Darker shadow
        glassBorder: '1px solid rgba(255, 255, 255, 0.08)',
    },
    light: {
        bg: '#ffffff',
        bgHeader: 'rgba(255, 255, 255, 0.95)',
        text: '#262626',
        textSecondary: '#737373',
        border: '#e5e7eb',
        inputBg: '#f3f4f6',
        cardBg: '#f9fafb',
        codeBg: '#f3f4f6',
        accent: '#2cbb5d',
        userMsgBg: '#2cbb5d',
        botMsgBg: '#f3f4f6',
        botMsgBorder: 'transparent',
        shadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        glassBorder: '1px solid rgba(0, 0, 0, 0.05)',
    }
};

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#000000',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#ffffff',
        lineColor: '#ffffff',
        secondaryColor: '#000000',
        tertiaryColor: '#000000',
        mainBkg: '#000000',
        nodeBorder: '#ffffff',
        clusterBkg: '#000000',
        clusterBorder: '#ffffff',
        defaultLinkColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        edgeLabelBackground: '#000000',
        fontSize: '12px',
    },
    flowchart: {
        nodeSpacing: 5,
        rankSpacing: 15,
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
    },
    securityLevel: 'loose',
});

const ZoomControls = () => {
    const { zoomIn, zoomOut, resetTransform, centerView } = useControls();
    return (
        <div style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            display: 'flex',
            gap: '5px',
            zIndex: 10
        }}>
            <button onClick={() => zoomIn()} title="Zoom In" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            <button onClick={() => zoomOut()} title="Zoom Out" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
            <button onClick={() => centerView(0.8)} title="Fit to View" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Maximize size={14} />
            </button>
            <button onClick={() => resetTransform()} title="Reset" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</button>
        </div>
    );
};

const MermaidDiagram = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0); // Force re-render of TransformWrapper on chart change

    useEffect(() => {
        if (ref.current && chart) {
            let cleanChart = chart.trim();
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

            const renderDiagram = async () => {
                try {
                    const { svg } = await mermaid.render(id, cleanChart);
                    if (ref.current) {
                        // Inject SVG
                        ref.current.innerHTML = svg;
                        const svgElement = ref.current.querySelector('svg');
                        if (svgElement) {
                            // Allow SVG to take its natural size but ensure it fits
                            svgElement.style.width = '100%';
                            svgElement.style.height = '100%';
                            svgElement.removeAttribute('maxWidth');

                            // Try to make nodes smaller via CSS injection
                            const style = document.createElement('style');
                            style.innerHTML = `
                                #${id} .node rect, #${id} .node circle, #${id} .node ellipse, #${id} .node polygon, #${id} .node path {
                                    stroke-width: 1.5px;
                                }
                                #${id} .edgeLabel {
                                    background-color: #121212 !important;
                                    color: #a1a1aa !important;
                                }
                            `;
                            ref.current.appendChild(style);
                        }
                        setError(null);
                        setKey(prev => prev + 1); // Force TransformWrapper to re-init and center
                    }
                } catch (e: any) {
                    console.error("Mermaid error:", e);
                    setError(e.message || "Unknown error");
                }
            };

            renderDiagram();
        }
    }, [chart]);

    if (error) {
        return (
            <div style={{ padding: '10px', border: '1px solid #ff4444', borderRadius: '8px', background: '#2a1a1a', marginTop: '10px' }}>
                <p style={{ color: '#ff4444', margin: '0 0 5px 0', fontSize: '12px' }}>Failed to render diagram: {error}</p>
                <pre style={{ margin: 0, fontSize: '11px', overflowX: 'auto', color: '#ccc', fontFamily: 'monospace' }}>
                    {chart}
                </pre>
            </div>
        );
    }

    return (
        <div style={{
            margin: '10px 0',
            background: '#121212',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            height: '400px', // Increased default height
            position: 'relative',
            resize: 'vertical', // Allow vertical resizing
            minHeight: '200px'
        }}>
            <TransformWrapper
                key={key}
                initialScale={1}
                minScale={0.1}
                maxScale={8}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
                limitToBounds={false}
                panning={{ velocityDisabled: true }}
                alignmentAnimation={{ disabled: true }}
            >
                <ZoomControls />
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
                    <div ref={ref} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

const MarkdownRenderer = ({ content, theme }: { content: string, theme: 'dark' | 'light' }) => {
    const colors = themes[theme];
    return (
        <ReactMarkdown
            components={{
                pre({ node, children, ...props }) {
                    return (
                        <pre {...props} style={{
                            background: colors.codeBg,
                            padding: '12px',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            border: colors.glassBorder,
                            margin: '10px 0',
                            color: colors.text
                        }}>
                            {children}
                        </pre>
                    );
                },
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isMermaid = match && match[1] === 'mermaid';

                    if (isMermaid) {
                        return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
                    }

                    // Also check if the content looks like a mermaid diagram even without the language tag
                    // This is a fallback for when the AI forgets the language tag
                    const contentStr = String(children).trim();
                    if (contentStr.startsWith('graph ') || contentStr.startsWith('sequenceDiagram')) {
                        return <MermaidDiagram chart={contentStr} />;
                    }

                    // If it's inline code (no match and not mermaid), style it differently
                    // But if it's inside a pre (block code), the pre handles the container style.
                    // ReactMarkdown passes `inline` prop but it's not in the types by default easily.
                    // However, block code usually comes with a match (language-xxx) or just no match but inside pre.
                    // We can check if it has a newline, or just rely on the parent pre.

                    return (
                        <code className={className} {...props} style={{
                            background: match ? 'transparent' : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                            padding: match ? 0 : '2px 4px',
                            borderRadius: '4px',
                            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                            fontSize: '13px',
                            color: colors.text
                        }}>
                            {children}
                        </code>
                    );
                }
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

type ChatMode = 'tutor' | 'hint' | 'planner';

const App: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 380, height: 500 });
    const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 80 });
    const [resizingDirection, setResizingDirection] = useState<string | null>(null);
    const resizeRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0, startXPos: 0, startYPos: 0 });
    const dragControls = useDragControls();

    // Jelly Effect Logic
    const x = useMotionValue(position.x);
    const y = useMotionValue(position.y);

    // Sync motion values with state when not dragging
    useEffect(() => {
        x.set(position.x);
        y.set(position.y);
    }, [position.x, position.y]);

    const xVelocity = useVelocity(x);
    const yVelocity = useVelocity(y);

    // Smoother, subtler jelly effect (Compiz-like)
    const skewX = useTransform(xVelocity, [-1000, 1000], [20, -20]);
    const skewY = useTransform(yVelocity, [-1000, 1000], [20, -20]);

    const springSkewX = useSpring(skewX, { stiffness: 150, damping: 12 });
    const springSkewY = useSpring(skewY, { stiffness: 150, damping: 12 });

    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedModel, setSelectedModel] = useState('auto');
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const colors = themes[theme];

    // State for separate chat histories
    const [activeMode, setActiveMode] = useState<ChatMode | null>(null);
    const [chatHistories, setChatHistories] = useState<Record<ChatMode, ChatMessage[]>>({
        tutor: [],
        hint: [],
        planner: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [inputKey, setInputKey] = useState('');
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistories, activeMode, isLoading]);

    // Detect problem change and clear history
    const [currentSlug, setCurrentSlug] = useState(() => {
        const match = window.location.pathname.match(/\/problems\/([^/]+)/);
        return match ? match[1] : null;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const match = window.location.pathname.match(/\/problems\/([^/]+)/);
            const newSlug = match ? match[1] : null;

            if (newSlug && newSlug !== currentSlug) {
                setCurrentSlug(newSlug);
                setChatHistories({
                    tutor: [],
                    hint: [],
                    planner: []
                });
                setActiveMode(null);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentSlug]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizingDirection) return;

            const deltaX = e.clientX - resizeRef.current.startX;
            const deltaY = e.clientY - resizeRef.current.startY;

            let newWidth = resizeRef.current.startWidth;
            let newHeight = resizeRef.current.startHeight;
            let newX = resizeRef.current.startXPos;
            let newY = resizeRef.current.startYPos;

            if (resizingDirection.includes('e')) {
                newWidth = Math.max(350, resizeRef.current.startWidth + deltaX);
            }
            if (resizingDirection.includes('w')) {
                const proposedWidth = resizeRef.current.startWidth - deltaX;
                if (proposedWidth >= 350) {
                    newWidth = proposedWidth;
                    newX = resizeRef.current.startXPos + deltaX;
                } else {
                    newWidth = 350;
                    newX = resizeRef.current.startXPos + (resizeRef.current.startWidth - 350);
                }
            }

            if (resizingDirection.includes('s')) {
                newHeight = Math.max(400, resizeRef.current.startHeight + deltaY);
            }
            if (resizingDirection.includes('n')) {
                const proposedHeight = resizeRef.current.startHeight - deltaY;
                if (proposedHeight >= 400) {
                    newHeight = proposedHeight;
                    newY = resizeRef.current.startYPos + deltaY;
                } else {
                    newHeight = 400;
                    newY = resizeRef.current.startYPos + (resizeRef.current.startHeight - 400);
                }
            }

            setDimensions({ width: newWidth, height: newHeight });
            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setResizingDirection(null);
        };

        if (resizingDirection) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingDirection]);

    const startResize = (e: React.MouseEvent, direction: string) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingDirection(direction);
        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: dimensions.width,
            startHeight: dimensions.height,
            startXPos: position.x,
            startYPos: position.y
        };
    };

    useEffect(() => {
        const storedKey = localStorage.getItem('leetbot_gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
            setInputKey(storedKey); // Pre-fill for settings
        }

        const storedModel = localStorage.getItem('leetbot_model');
        if (storedModel) setSelectedModel(storedModel);

        const storedTheme = localStorage.getItem('leetbot_theme') as 'dark' | 'light';
        if (storedTheme) setTheme(storedTheme);
    }, []);

    const handleSaveSettings = () => {
        if (inputKey.trim()) {
            localStorage.setItem('leetbot_gemini_api_key', inputKey.trim());
            setApiKey(inputKey.trim());
        }
        localStorage.setItem('leetbot_model', selectedModel);
        setShowSettings(false);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('leetbot_theme', newTheme);
    };

    const resetChat = () => {
        if (activeMode) {
            setChatHistories(prev => ({
                ...prev,
                [activeMode]: []
            }));
        }
    };

    const getUserCode = () => {
        const codeLines = document.querySelectorAll('.view-line');
        if (codeLines.length > 0) {
            return Array.from(codeLines).map(line => line.textContent).join('\n');
        }
        return undefined;
    };

    const handleAction = async (mode: ChatMode, customPrompt?: string) => {
        if (!apiKey) return;

        // If switching modes, just set the mode and return if history exists
        if (!customPrompt && activeMode !== mode) {
            setActiveMode(mode);
            if (chatHistories[mode].length > 0) {
                return;
            }
        }

        setIsLoading(true);

        // Add user message if it's a custom prompt
        if (customPrompt) {
            setChatHistories(prev => ({
                ...prev,
                [mode]: [...prev[mode], { role: 'user', content: customPrompt }]
            }));
        }

        // TODO: Get actual problem context from the page
        const problemContext = document.title + "\n" + (document.querySelector('meta[name="description"]')?.getAttribute('content') || "");
        const userCode = getUserCode();

        let prompt;
        if (customPrompt) {
            // For follow-up questions, we need to remind the AI of its role
            let roleInstruction = "";
            if (mode === 'planner') roleInstruction = "You are helping plan a solution. If the user has completed the brute force approach, guide them towards the optimization. Otherwise, stick to the current step.";
            if (mode === 'tutor') roleInstruction = "You are a tutor explaining the problem concepts.";
            if (mode === 'hint') roleInstruction = "You are giving small hints.";

            // Get recent history (last 10 messages to avoid context overflow, though Gemini is large)
            const history = chatHistories[mode].slice(-10).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');

            prompt = `
             Context: ${problemContext}
             ${userCode ? `User Code:\n\`\`\`\n${userCode}\n\`\`\`` : ''}
             Role: ${roleInstruction}
             
             Previous Conversation:
             ${history}

             User Question: ${customPrompt}
             
             Answer the user's question. Use Mermaid diagrams if helpful.
             
             IMPORTANT MERMAID INSTRUCTIONS:
             1. Do NOT include the word "mermaid" inside the code block itself. Start directly with "graph TD" or "sequenceDiagram".
             2. ALWAYS wrap node labels in double quotes.
             3. Do NOT use brackets [] inside the node label text itself, even if quoted. Use parentheses () instead.
                - BAD: A["Array [1, 2]"]
                - GOOD: A["Array (1, 2)"]
             `;
        } else {
            prompt = createSystemPrompt(mode, problemContext, userCode);
        }

        try {
            const result = await generateResponse(prompt, selectedModel);
            setChatHistories(prev => ({
                ...prev,
                [mode]: [...prev[mode], { role: 'assistant', content: result }]
            }));
        } catch (error: any) {
            setChatHistories(prev => ({
                ...prev,
                [mode]: [...prev[mode], { role: 'assistant', content: "Error: " + error.toString() }]
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatSubmit = () => {
        if (!chatInput.trim() || !activeMode) return;
        handleAction(activeMode, chatInput);
        setChatInput('');
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        top: '10px',
                        left: '100px',
                        transform: 'none',
                        right: 'auto',
                        bottom: 'auto',
                        backgroundColor: '#4ade80', // Brighter Green
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(74, 222, 128, 0.4)', // Glow
                        zIndex: 2147483647,
                        pointerEvents: 'auto',
                    }}
                >
                    <Brain size={22} />
                </motion.button>
            )}

            {/* Floating Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        drag
                        dragControls={dragControls}
                        dragListener={false}
                        dragMomentum={false}
                        dragElastic={0}
                        initial={{ opacity: 0, scale: 0.9, x: position.x, y: position.y }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            width: dimensions.width,
                            height: dimensions.height,
                            // We don't animate x/y here to let drag handle it smoothly, 
                            // but we need to ensure it snaps back if we update position state externally
                        }}
                        style={{
                            x, y, // Bind motion values
                            skewX: springSkewX,
                            skewY: springSkewY,
                            position: 'fixed',
                            backgroundColor: 'transparent',
                            color: colors.text,
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 2147483647,
                            pointerEvents: 'auto',
                            backfaceVisibility: 'hidden',
                            WebkitFontSmoothing: 'subpixel-antialiased',
                            transform: 'translateZ(0)',
                            willChange: 'transform'
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onDragEnd={() => {
                            const newX = x.get();
                            const newY = y.get();
                            // Clamp to ensure it stays on screen with a buffer
                            const clampedX = Math.max(0, Math.min(window.innerWidth - dimensions.width, newX));
                            const clampedY = Math.max(10, Math.min(window.innerHeight - dimensions.height, newY)); // 10px buffer from top

                            setPosition({ x: clampedX, y: clampedY });
                            // Explicitly set motion values to clamped position
                            x.set(clampedX);
                            y.set(clampedY);
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {/* Resize Handles */}
                        <div onMouseDown={(e) => startResize(e, 'n')} style={{ position: 'absolute', top: 0, left: 10, right: 10, height: '6px', cursor: 'ns-resize', zIndex: 20 }} />
                        <div onMouseDown={(e) => startResize(e, 's')} style={{ position: 'absolute', bottom: 0, left: 10, right: 10, height: '6px', cursor: 'ns-resize', zIndex: 20 }} />
                        <div onMouseDown={(e) => startResize(e, 'e')} style={{ position: 'absolute', top: 10, bottom: 10, right: 0, width: '6px', cursor: 'ew-resize', zIndex: 20 }} />
                        <div onMouseDown={(e) => startResize(e, 'w')} style={{ position: 'absolute', top: 10, bottom: 10, left: 0, width: '6px', cursor: 'ew-resize', zIndex: 20 }} />
                        <div onMouseDown={(e) => startResize(e, 'ne')} style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', cursor: 'nesw-resize', zIndex: 21 }} />
                        <div onMouseDown={(e) => startResize(e, 'nw')} style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', cursor: 'nwse-resize', zIndex: 21 }} />
                        <div onMouseDown={(e) => startResize(e, 'se')} style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', cursor: 'nwse-resize', zIndex: 21 }} />
                        <div onMouseDown={(e) => startResize(e, 'sw')} style={{ position: 'absolute', bottom: 0, left: 0, width: '12px', height: '12px', cursor: 'nesw-resize', zIndex: 21 }} />

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: '16px',
                            backgroundColor: colors.bg,
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            boxShadow: colors.shadow,
                            border: colors.glassBorder,
                        }}>
                            {/* Header / Drag Handle */}
                            <div
                                onPointerDown={(e) => dragControls.start(e)}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: `1px solid ${colors.border}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: colors.bgHeader,
                                    backdropFilter: 'blur(20px)',
                                    cursor: 'grab',
                                    userSelect: 'none',
                                    touchAction: 'none',
                                    zIndex: 20
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', // Brighter Green Gradient
                                        padding: '6px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        boxShadow: '0 0 15px rgba(74, 222, 128, 0.4)' // Glow effect
                                    }}>
                                        <Brain size={14} color="white" />
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.text, letterSpacing: '-0.01em' }}>LeetBot</h2>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 180 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={resetChat}
                                        title="Clear Chat"
                                        style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                                    >
                                        <RotateCcw size={16} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={toggleTheme}
                                        style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                                    >
                                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowSettings(!showSettings)}
                                        style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                                    >
                                        <Settings size={16} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsOpen(false)}
                                        style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                                    >
                                        <X size={16} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div style={{ flex: 1, padding: '0', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>

                                {(!apiKey || showSettings) ? (
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ padding: '20px', background: colors.cardBg, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                                            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '16px', color: colors.text }}>
                                                {apiKey ? 'Settings' : 'Setup API Key'}
                                            </h3>

                                            {/* API Key Input */}
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>Gemini API Key</label>
                                                <input
                                                    type="password"
                                                    value={inputKey}
                                                    onChange={(e) => setInputKey(e.target.value)}
                                                    placeholder="Paste your Gemini API Key here"
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${colors.border}`,
                                                        background: colors.inputBg,
                                                        color: colors.text,
                                                        outline: 'none',
                                                        fontSize: '13px'
                                                    }}
                                                />
                                                {!apiKey && (
                                                    <p style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '4px' }}>
                                                        It's free and easy to get from Google AI Studio.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Model Selection */}
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>AI Model</label>
                                                <div style={{ position: 'relative' }}>
                                                    <select
                                                        value={selectedModel}
                                                        onChange={(e) => setSelectedModel(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            border: `1px solid ${colors.border}`,
                                                            background: colors.inputBg,
                                                            color: colors.text,
                                                            outline: 'none',
                                                            fontSize: '13px',
                                                            appearance: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="auto">Auto (Recommended)</option>
                                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                                    </select>
                                                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: colors.textSecondary }} />
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleSaveSettings}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        background: colors.accent,
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    Save & Continue
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setPosition({ x: window.innerWidth - 400, y: 80 });
                                                        setDimensions({ width: 380, height: 500 });
                                                    }}
                                                    style={{
                                                        padding: '10px',
                                                        background: colors.inputBg,
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '8px',
                                                        color: colors.text,
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        fontSize: '13px'
                                                    }}
                                                    title="Reset Window Position"
                                                >
                                                    Reset Pos
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mode Tabs */}
                                        <div style={{
                                            padding: '16px 16px 0 16px',
                                            background: colors.bg,
                                            zIndex: 10
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                background: colors.inputBg,
                                                padding: '4px',
                                                borderRadius: '10px',
                                                gap: '4px'
                                            }}>
                                                <TabButton
                                                    active={activeMode === 'tutor'}
                                                    onClick={() => handleAction('tutor')}
                                                    icon={<Lightbulb size={14} />}
                                                    title="Tutor"
                                                    colors={colors}
                                                />
                                                <TabButton
                                                    active={activeMode === 'hint'}
                                                    onClick={() => handleAction('hint')}
                                                    icon={<MessageSquare size={14} />}
                                                    title="Hint"
                                                    colors={colors}
                                                />
                                                <TabButton
                                                    active={activeMode === 'planner'}
                                                    onClick={() => handleAction('planner')}
                                                    icon={<Play size={14} />}
                                                    title="Plan"
                                                    colors={colors}
                                                />
                                            </div>
                                        </div>

                                        {/* Chat History */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', padding: '16px' }}>
                                            {!activeMode ? (
                                                <div style={{ textAlign: 'center', color: colors.textSecondary, marginTop: '40px' }}>
                                                    <Brain size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                                    <p style={{ fontSize: '14px' }}>Select a mode above to start learning.</p>
                                                    <div style={{
                                                        marginTop: '20px',
                                                        padding: '8px 12px',
                                                        background: colors.cardBg,
                                                        borderRadius: '8px',
                                                        display: 'inline-block',
                                                        fontSize: '12px',
                                                        color: colors.textSecondary
                                                    }}>
                                                        Current: {document.title.split('-')[0] || "LeetCode Problem"}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {chatHistories[activeMode].map((msg, idx) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            key={idx}
                                                            style={{
                                                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                                                background: msg.role === 'user'
                                                                    ? colors.userMsgBg
                                                                    : colors.botMsgBg,
                                                                color: msg.role === 'user' ? 'white' : colors.text,
                                                                padding: '12px 16px',
                                                                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                                maxWidth: '85%',
                                                                wordWrap: 'break-word',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                fontSize: '13px',
                                                                lineHeight: '1.6',
                                                                border: msg.role === 'assistant' ? `1px solid ${colors.botMsgBorder}` : 'none'
                                                            }}
                                                        >
                                                            {msg.role === 'assistant' ? (
                                                                <MarkdownRenderer content={msg.content} theme={theme} />
                                                            ) : (
                                                                msg.content
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </>
                                            )}
                                            {isLoading && (
                                                <div style={{ alignSelf: 'flex-start', color: colors.textSecondary, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                                                    <div className="typing-indicator">
                                                        {activeMode === 'tutor' ? 'Preparing lesson...' :
                                                            activeMode === 'hint' ? 'Analyzing code...' :
                                                                activeMode === 'planner' ? 'Devising plan...' : 'Thinking...'}
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Chat Input Area */}
                            <div style={{ padding: '16px', background: 'transparent', position: 'relative' }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    background: colors.inputBg,
                                    padding: '8px',
                                    borderRadius: '24px',
                                    border: `1px solid ${colors.border}`,
                                    alignItems: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                                        placeholder="Ask a follow-up question..."
                                        style={{
                                            flex: 1,
                                            padding: '4px 12px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: colors.text,
                                            outline: 'none',
                                            fontSize: '13px',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleChatSubmit}
                                        style={{
                                            background: colors.accent,
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 2px 8px ${colors.accent}66`
                                        }}
                                    >
                                        <Send size={14} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TabButton = ({ icon, title, active, onClick, colors }: { icon: React.ReactNode, title: string, active: boolean, onClick: () => void, colors: any }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            backgroundColor: active ? colors.cardBg : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: active ? colors.accent : colors.textSecondary,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 500,
            fontSize: '12px',
            boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
        }}
    >
        {icon}
        <span>{title}</span>
    </motion.button>
);

export default App;
