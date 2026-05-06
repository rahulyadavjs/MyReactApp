import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const res = await axios.post("http://localhost:5000/chat", {
      message: input
    });

    setMessages([
      ...messages,
      { user: input, bot: res.data.reply }
    ]);

    setInput("");
  };

  return (
    <div>
      <div style={{ minHeight: 300, border: "1px solid gray", padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>You:</b> {m.user}
            <br />
            <b>Bot:</b> {m.bot}
            <hr />
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}