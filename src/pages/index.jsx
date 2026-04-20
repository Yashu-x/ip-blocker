import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [blockingIp, setBlockingIp] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/requests")
      .then((response) => response.json())
      .then((payload) => {
        if (mounted) {
          setRequests(payload.data || []);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Failed to load requests");
        }
      });

    const socket = io({
      autoConnect: true
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("request:created", (request) => {
      setRequests((current) => [request, ...current].slice(0, 200));
    });
    socket.on("ip:blocked", (record) => {
      setRequests((current) =>
        current.map((item) =>
          item.ip === record.ip ? { ...item, blocked: true } : item
        )
      );
    });

    return () => {
      mounted = false;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  async function handleBlockIp(ip) {
    setBlockingIp(ip);
    setError("");

    try {
      const response = await fetch("/block-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ip })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to block IP");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBlockingIp("");
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Nginx Traffic Monitor</p>
          <h1>Realtime IP watch dashboard</h1>
          <p className="description">
            Streaming access logs, alerting on request floods, and allowing rapid
            firewall blocks from one screen.
          </p>
        </div>
        <div className={`status ${connected ? "online" : "offline"}`}>
          {connected ? "Socket connected" : "Socket disconnected"}
        </div>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <section className="panel">
        <div className="panelHeader">
          <h2>Live requests</h2>
          <span>{requests.length} visible rows</span>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>IP</th>
                <th>Country</th>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{new Date(request.requestedAt).toLocaleString()}</td>
                  <td>{request.ip}</td>
                  <td>{request.country}</td>
                  <td>{request.method}</td>
                  <td className="endpoint">{request.endpoint}</td>
                  <td>
                    <span className={`statusCode s${request.status}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleBlockIp(request.ip)}
                      disabled={blockingIp === request.ip || request.blocked}
                    >
                      {request.blocked ? "Blocked" : blockingIp === request.ip ? "Blocking..." : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx global>{`
        :root {
          color-scheme: light;
          --bg: #f2efe7;
          --panel: rgba(255, 252, 245, 0.92);
          --ink: #1f1a17;
          --muted: #6b625c;
          --accent: #b34d2f;
          --accent-soft: #f7d9cc;
          --good: #246a4a;
          --bad: #8e2b25;
          --line: rgba(31, 26, 23, 0.12);
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          background:
            radial-gradient(circle at top left, rgba(179, 77, 47, 0.18), transparent 28%),
            linear-gradient(180deg, #fcfaf5 0%, var(--bg) 100%);
          color: var(--ink);
        }

        button {
          border: 0;
          border-radius: 999px;
          padding: 0.65rem 1rem;
          background: var(--ink);
          color: white;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 32px;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--accent);
          font-size: 0.75rem;
          margin: 0 0 12px;
        }

        h1 {
          margin: 0;
          font-size: clamp(2rem, 5vw, 4.3rem);
          line-height: 0.95;
          max-width: 10ch;
        }

        .description {
          max-width: 54ch;
          color: var(--muted);
          font-size: 1rem;
        }

        .status {
          padding: 12px 16px;
          border-radius: 999px;
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .online {
          background: rgba(36, 106, 74, 0.12);
          color: var(--good);
        }

        .offline {
          background: rgba(142, 43, 37, 0.12);
          color: var(--bad);
        }

        .error {
          padding: 12px 16px;
          background: rgba(142, 43, 37, 0.12);
          color: var(--bad);
          border-radius: 14px;
          margin: 0 0 16px;
        }

        .panel {
          background: var(--panel);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(63, 37, 20, 0.08);
        }

        .panelHeader {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--line);
        }

        .panelHeader h2 {
          margin: 0;
          font-size: 1.4rem;
        }

        .tableWrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid var(--line);
          vertical-align: top;
        }

        th {
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .endpoint {
          max-width: 360px;
          word-break: break-all;
        }

        .statusCode {
          display: inline-flex;
          min-width: 48px;
          justify-content: center;
          padding: 0.3rem 0.55rem;
          border-radius: 999px;
          background: rgba(31, 26, 23, 0.08);
        }

        .s200, .s201, .s204, .s301, .s302 {
          color: var(--good);
        }

        .s400, .s401, .s403, .s404, .s429, .s500, .s502, .s503 {
          color: var(--bad);
        }

        @media (max-width: 768px) {
          .page {
            padding: 20px;
          }

          .hero {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
