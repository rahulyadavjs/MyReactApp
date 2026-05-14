import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Chat() {
  const createSession = () => ({
    id: "session-" + Date.now(),
    title: "New Chat",
    messages: []
  });

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("chatSessions");
    return saved ? JSON.parse(saved) : [createSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem("chatSessions");
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.[0]?.id || "session-" + Date.now();
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const messages = activeSession?.messages || [];

  const saveSessions = (updatedSessions) => {
    setSessions(updatedSessions);
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
  };

  const newChat = () => {
    const session = createSession();
    const updated = [session, ...sessions];
    saveSessions(updated);
    setActiveSessionId(session.id);
  };

  const deleteSession = (sessionId) => {
  const updated = sessions.filter((s) => s.id !== sessionId);
    if (updated.length === 0) {
      const newSession = createSession();
      updated.push(newSession);
      setActiveSessionId(newSession.id);
    } else if (activeSessionId === sessionId) {
      setActiveSessionId(updated[0].id);
  }

  saveSessions(updated);
};

 const updateActiveMessages = (newMessages, title = null) => {
  const updated = sessions.map((s) => {
    if (s.id !== activeSessionId) return s;

    let updatedTitle = s.title;

    // First user message becomes chat title
    if (
      s.title === "New Chat" &&
      newMessages.length > 0 &&
      newMessages[0].user
    ) {
      updatedTitle = newMessages[0].user.substring(0, 30);
    }

    // Explicit title override
    if (title) {
      updatedTitle = title;
    }

    return {
      ...s,
      title: updatedTitle,
      messages: newMessages
    };
  });

  saveSessions(updated);
};

  const toggleGrid = (index) => {
    const updatedMessages = messages.map((msg, i) =>
      i === index ? { ...msg, showGrid: !msg.showGrid } : msg
    );

    updateActiveMessages(updatedMessages);
  };

  const toggleSql = (index) => {
    const updatedMessages = messages.map((msg, i) =>
      i === index ? { ...msg, showSql: !msg.showSql } : msg
    );

    updateActiveMessages(updatedMessages);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userQuestion = input;
    setInput("");
    setLoading(true);

    const pendingMessages = [
      ...messages,
      {
        user: userQuestion,
        bot: "",
        data: [],
        sql: "",
        showGrid: false,
        showSql: false
      }
    ];

    updateActiveMessages(pendingMessages);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat-ask-ai", {
        question: userQuestion,
        session_id: activeSessionId
      });

      setIsOnline(true);

      const apiData = Array.isArray(res.data.data) ? res.data.data : [];

      const finalMessages = [...pendingMessages];
      finalMessages[finalMessages.length - 1] = {
        user: userQuestion,
        bot:
          res.data.summary ||
          res.data.answer ||
          res.data.message ||
          "Response received.",
        data: apiData,
        sql: res.data.sql || res.data.query || "",
        showGrid: false,
        showSql: false
      };

      updateActiveMessages(finalMessages);
    } catch (error) {
      setIsOnline(false);

      const errorMessages = [...pendingMessages];
      errorMessages[errorMessages.length - 1] = {
        user: userQuestion,
        bot: "Something went wrong. Please check API.",
        data: [],
        sql: "",
        showGrid: false,
        showSql: false
      };

      updateActiveMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  };


  const startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInput(spokenText);
    };
    recognition.onend = () => {
      console.log("Voice recognition ended");
    };
   recognition.onerror = (event) => {
      console.error("Voice input error:", event.error);

      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access.");
      } else if (event.error === "no-speech") {
        alert("No speech detected. Please try again.");
      } else if (event.error === "network") {
        alert("Voice recognition network error. Please check internet.");
      } else {
        alert("Voice input failed: " + event.error);
      }
    };
  };
   const exportChat = () => {
      let content = "";

      messages.forEach((m) => {
        content += `User: ${m.user}\n`;
        content += `Bot: ${m.bot}\n`;

        if (m.sql) {
          content += `SQL:\n${m.sql}\n`;
        }

        content += "\n-----------------------------------\n\n";
      });

      const blob = new Blob([content], { type: "text/plain" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      link.download = `${activeSession.title || "chat"}.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }; 
    const messagesEndRef = useRef(null);

      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [messages, loading]);
  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <button onClick={newChat} style={styles.newChatButton}>
          + New Chat
        </button>
        <button onClick={exportChat} style={styles.exportButton}>
          Export Chat
        </button>
        <div style={styles.historyTitle}>Chat History</div>

        {sessions.map((session) => (
         <div
            key={session.id}
            style={{
              ...styles.sessionItem,
              background:
                session.id === activeSessionId ? "#1e3c72" : "#ffffff",
              color: session.id === activeSessionId ? "#ffffff" : "#333"
            }}
          >
            <div
              style={styles.sessionText}
              onClick={() => setActiveSessionId(session.id)}
            >
              {session.title}
            </div>

            <button
              style={styles.deleteButton}
              onClick={() => deleteSession(session.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={styles.chatContainer}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>AI SQL Assistant</h2>
            <p style={styles.headerSubTitle}>Ask questions from your data</p>
          </div>

          <div
            style={{
              ...styles.status,
              color: isOnline ? "#8dffb1" : "#ff4d4f",
              fontWeight: "bold"
            }}
          >
            ● {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        <div style={styles.messagesArea}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <h3>Welcome 👋</h3>
              <p>Ask something like:</p>
              <div
                style={styles.suggestion}
                onClick={() => setInput("Show release records")}
              >
                Show release records
              </div>

              <div
                style={styles.suggestion}
                onClick={() => setInput("Show pending documents")}
              >
                Show pending documents
              </div>

              <div
                style={styles.suggestion}
                onClick={() => setInput("Give me latest records")}
              >
                Give me latest records
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={styles.messageBlock}>
              <div style={styles.userRow}>
                <div style={styles.userBubble}>{m.user}</div>
              </div>

              <div style={styles.botRow}>
                <div style={styles.botAvatar}>AI</div>

                <div style={styles.botBubble}>
                  {m.bot || "Thinking..."}

                  {m.bot && (
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.smallButton}
                        onClick={() => toggleGrid(i)}
                      >
                        View Grid
                      </button>

                      <button
                        style={styles.smallButton}
                        onClick={() => toggleSql(i)}
                      >
                        View SQL Query
                      </button>
                      <button
                        style={styles.smallButton}
                        onClick={(e) => {
                          navigator.clipboard.writeText(m.bot || "");

                          e.target.innerText = "Copied!";
                          e.target.style.background = "#16a34a";

                          setTimeout(() => {
                            e.target.innerText = "Copy Response";
                            e.target.style.background = "#1e3c72";
                          }, 1500);
                        }}
                      >
                        Copy Response
                      </button>
                    </div>
                  )}

                 {m.showSql && (
                    <div style={styles.sqlBox}>
                      <button
                        style={styles.copyButton}
                        onClick={(e) => {
                          navigator.clipboard.writeText(m.sql || "");

                          e.target.innerText = "Copied!";
                          e.target.style.background = "#16a34a";

                          setTimeout(() => {
                            e.target.innerText = "Copy SQL";
                            e.target.style.background = "#1e3c72";
                          }, 1500);
                        }}
                      >
                        Copy SQL
                      </button>

                      <pre style={styles.pre}>
                        {m.sql || "No SQL query returned"}
                      </pre>
                    </div>
                  )}
                  
                  {m.showGrid &&
                    Array.isArray(m.data) &&
                    m.data.length > 0 && (
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            {Object.keys(m.data[0]).map((key) => (
                              <th key={key} style={styles.th}>
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {m.data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {Object.values(row).map((value, colIndex) => (
                                <td key={colIndex} style={styles.td}>
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              </div>
            </div>
          ))}

          {loading && <div style={styles.typing}>AI is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputArea}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask something..."
            style={styles.input}
          />
          <button
            onClick={startVoiceInput}
            style={styles.micButton}
            title="Voice input"
          >
            🎤
          </button>
          <button onClick={sendMessage} disabled={loading} style={styles.button}>
            {loading ? "Wait" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    height: "calc(100vh - 72px)",
    display: "flex",
    background: "#f3f6fb"
  },
  sqlBox: {
  marginTop: "10px",
  position: "relative"
  },
  exportButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#16a34a",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "12px"
  },
  micButton: {
    marginLeft: "10px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "none",
    background: "#ffffff",
    color: "#1e3c72",
    fontSize: "18px",
    cursor: "pointer",
    border: "1px solid #cfd8e3"
  },
  copyButton: {
    position: "absolute",
    right: "10px",
    top: "10px",
    border: "none",
    background: "#1e3c72",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold"
  },
  sidebar: {
    width: "260px",
    background: "#ffffff",
    borderRight: "1px solid #dbe5f1",
    padding: "16px",
    overflowY: "auto"
  },

  newChatButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#1e3c72",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "18px"
  },

  historyTitle: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: "10px"
  },

  sessionItem: {
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "8px",
    cursor: "pointer",
    fontSize: "14px",
    border: "1px solid #e5e7eb"
  },

  chatContainer: {
    flex: 1,
    margin: "20px",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  },

  header: {
    padding: "18px 24px",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headerTitle: {
    margin: 0,
    fontSize: "22px"
  },

  headerSubTitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    opacity: 0.9
  },

  status: {
    fontSize: "13px"
  },

  messagesArea: {
    flex: 1,
    padding: "22px",
    overflowY: "auto",
    background: "#eef3f9"
  },

  emptyState: {
    textAlign: "center",
    color: "#4b5563",
    marginTop: "80px"
  },

  suggestion: {
    display: "inline-block",
    margin: "6px",
    padding: "9px 14px",
    background: "#ffffff",
    border: "1px solid #d9e3ef",
    borderRadius: "20px",
    fontSize: "13px"
  },

  messageBlock: {
    marginBottom: "20px"
  },

  userRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px"
  },

  botRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px"
  },

  userBubble: {
    maxWidth: "70%",
    background: "#1e3c72",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "16px 16px 4px 16px",
    fontSize: "14px",
    lineHeight: "1.5"
  },

  botBubble: {
    maxWidth: "75%",
    background: "#ffffff",
    color: "#222",
    padding: "12px 16px",
    borderRadius: "16px 16px 16px 4px",
    border: "1px solid #dbe5f1",
    fontSize: "14px",
    lineHeight: "1.5"
  },

  botAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#2a5298",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "bold"
  },

  inputArea: {
    display: "flex",
    padding: "16px",
    background: "#fff",
    borderTop: "1px solid #e5e7eb"
  },

  input: {
    flex: 1,
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid #cfd8e3",
    outline: "none",
    fontSize: "14px"
  },

  button: {
    marginLeft: "10px",
    padding: "0 24px",
    borderRadius: "12px",
    border: "none",
    background: "#1e3c72",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer"
  },

  typing: {
    fontSize: "13px",
    color: "#555",
    marginTop: "8px"
  },

  actionButtons: {
    marginTop: "12px",
    display: "flex",
    gap: "10px"
  },

  smallButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#1e3c72",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold"
  },

  pre: {
    marginTop: "10px",
    background: "#f6f8fa",
    padding: "12px",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "12px"
  },

  table: {
    marginTop: "12px",
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    fontSize: "12px"
  },

  th: {
    border: "1px solid #ddd",
    padding: "8px",
    background: "#eef3f9",
    fontWeight: "bold"
  },

  td: {
    border: "1px solid #ddd",
    padding: "8px"
  },
  suggestion: {
  display: "inline-block",
  margin: "6px",
  padding: "9px 14px",
  background: "#ffffff",
  border: "1px solid #d9e3ef",
  borderRadius: "20px",
  fontSize: "13px",
  cursor: "pointer"
  },
  sessionItem: {
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "8px",
    cursor: "pointer",
    fontSize: "14px",
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
  },

  sessionText: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },

  deleteButton: {
    border: "none",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  }
};