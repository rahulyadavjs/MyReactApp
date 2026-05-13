import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

   const toggleGrid = (index) => {
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === index ? { ...msg, showGrid: !msg.showGrid } : msg
        )
      );
    };

    const toggleSql = (index) => {
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === index ? { ...msg, showSql: !msg.showSql } : msg
        )
      );
    };
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userQuestion = input;
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
       user: userQuestion,
        bot: "",
        data: [],
        sql: "",
        showGrid: false,
        showSql: false
      }
    ]);   

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat-ask-ai", {
        question: userQuestion,
        session_id: "rahul-session"
      });
      setIsOnline(true);
      setMessages((prev) => {
        const updated = [...prev];
       updated[updated.length - 1] = {
          user: userQuestion,
          bot: res.data.reply,
          data: res.data.data,
          sql: res.data.sql || "",
          showGrid: false,
          showSql: false
        };
        return updated;
      });
    } catch (error) {
       setIsOnline(false);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          user: userQuestion,
          bot: "Something went wrong. Please check API.",
          data: ""
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
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
              <div style={styles.suggestion}>Show release records</div>
              <div style={styles.suggestion}>Show pending documents</div>
              <div style={styles.suggestion}>Give me latest records</div>
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

                 {m.data && (
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
                    </div>            
                  )}
                  {m.showSql && (
                  <pre style={styles.pre}>
                    {m.sql || "No SQL query returned"}
                  </pre>
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

          {loading && (
            <div style={styles.typing}>
              <span>AI is thinking</span>
              <span style={styles.dot}>...</span>
            </div>
          )}
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

          <button onClick={sendMessage} disabled={loading} style={styles.button}>
            {loading ? "Wait" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 120px)",
    background: "#f3f6fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },
  chatContainer: {
    width: "850px",
    height: "78vh",
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
    fontSize: "13px",
    color: "#c8ffd3"
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
  dot: {
    letterSpacing: "2px"
  },
  details: {
    marginTop: "12px"
  },
  summary: {
    cursor: "pointer",
    color: "#1e3c72",
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
}
};