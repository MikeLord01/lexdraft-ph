import { useState } from "react";

const DOCUMENT_TYPES = {
  contract: {
    label: "Contract & Agreement",
    icon: "⚖️",
    fields: [
      { id: "parties", label: "Parties Involved", placeholder: "e.g. Juan dela Cruz and ABC Corporation", type: "text" },
      { id: "subject", label: "Subject / Purpose", placeholder: "e.g. Sale of real property located at...", type: "text" },
      { id: "amount", label: "Amount / Consideration", placeholder: "e.g. PHP 1,500,000.00", type: "text" },
      { id: "terms", label: "Key Terms & Conditions", placeholder: "e.g. Payment in 3 installments, delivery within 30 days...", type: "textarea" },
      { id: "date", label: "Date of Execution", placeholder: "e.g. March 26, 2026", type: "text" },
    ],
    prompt: (f) => `Draft a formal Philippine legal Contract and Agreement with the following details:
Parties: ${f.parties}
Subject/Purpose: ${f.subject}
Consideration/Amount: ${f.amount}
Key Terms: ${f.terms}
Date: ${f.date}

Use proper Philippine legal format. Include: title, recitals/whereas clauses, operative provisions, obligations of each party, breach and remedies, governing law (Philippine law), dispute resolution, signatures block. Be formal, precise, and legally sound under Philippine law.`,
  },
  affidavit: {
    label: "Affidavit",
    icon: "📜",
    fields: [
      { id: "affiant", label: "Affiant (Full Name)", placeholder: "e.g. Maria Santos, Filipino, of legal age", type: "text" },
      { id: "address", label: "Address of Affiant", placeholder: "e.g. 123 Rizal Street, Quezon City", type: "text" },
      { id: "facts", label: "Facts to be Attested", placeholder: "Describe the facts the affiant is swearing to...", type: "textarea" },
      { id: "purpose", label: "Purpose of Affidavit", placeholder: "e.g. To attest to the loss of original document...", type: "text" },
      { id: "date", label: "Date", placeholder: "e.g. March 26, 2026", type: "text" },
    ],
    prompt: (f) => `Draft a formal Philippine Affidavit with the following details:
Affiant: ${f.affiant}
Address: ${f.address}
Facts: ${f.facts}
Purpose: ${f.purpose}
Date: ${f.date}

Use proper Philippine affidavit format. Include: title, jurisdiction/venue, body with numbered paragraphs of sworn statements, attestation clause, jurat (notarial acknowledgment block), signature lines. Formal, legally sound under Philippine law and the 2004 Rules on Notarial Practice.`,
  },
  demand: {
    label: "Demand Letter",
    icon: "✉️",
    fields: [
      { id: "sender", label: "Sender (Lawyer / Client Name)", placeholder: "e.g. Atty. Jose Reyes on behalf of XYZ Corp.", type: "text" },
      { id: "recipient", label: "Recipient", placeholder: "e.g. Mr. Pedro Gomez, ABC Trading", type: "text" },
      { id: "claim", label: "Nature of Claim", placeholder: "e.g. Unpaid balance of PHP 250,000 under Invoice No. 101", type: "text" },
      { id: "deadline", label: "Deadline to Comply", placeholder: "e.g. 15 days from receipt", type: "text" },
      { id: "consequences", label: "Consequences if Ignored", placeholder: "e.g. Filing of civil and/or criminal case", type: "text" },
    ],
    prompt: (f) => `Draft a formal Philippine Demand Letter with the following details:
Sender: ${f.sender}
Recipient: ${f.recipient}
Nature of Claim: ${f.claim}
Deadline: ${f.deadline}
Consequences: ${f.consequences}

Use proper Philippine legal demand letter format. Include: letterhead placeholder, date, proper salutation, background facts, specific demand, deadline with clear ultimatum, legal basis for the claim, signature block. Firm, professional, and legally appropriate tone under Philippine law.`,
  },
  notice: {
    label: "Legal Notice",
    icon: "📋",
    fields: [
      { id: "issuer", label: "Issuing Party", placeholder: "e.g. ABC Realty Corporation", type: "text" },
      { id: "recipient", label: "Recipient", placeholder: "e.g. Mr. Juan dela Cruz, tenant", type: "text" },
      { id: "noticeType", label: "Type of Notice", placeholder: "e.g. Notice to Vacate, Notice of Default, Notice of Hearing", type: "text" },
      { id: "details", label: "Details / Grounds", placeholder: "Explain the basis and specifics of this notice...", type: "textarea" },
      { id: "date", label: "Date", placeholder: "e.g. March 26, 2026", type: "text" },
    ],
    prompt: (f) => `Draft a formal Philippine Legal Notice with the following details:
Issuing Party: ${f.issuer}
Recipient: ${f.recipient}
Type of Notice: ${f.noticeType}
Details/Grounds: ${f.details}
Date: ${f.date}

Use proper Philippine legal notice format. Include: title clearly stating the type of notice, formal address, body with numbered paragraphs stating grounds and legal basis, specific action required, timeline, consequences of non-compliance, proper signature block. Formal and legally sound under Philippine law.`,
  },
};

const PLANS = [
  { name: "Starter", price: "₱999", docs: "10 documents/mo", color: "#c8a96e" },
  { name: "Professional", price: "₱2,499", docs: "Unlimited documents", color: "#1a3a5c", popular: true },
  { name: "Firm", price: "₱5,999", docs: "Unlimited + 5 users", color: "#2d6a4f" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("generate");
  const [docType, setDocType] = useState("contract");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const currentDoc = DOCUMENT_TYPES[docType];

  const handleField = (id, val) => setFields((p) => ({ ...p, [id]: val }));

  const generate = async () => {
    const missing = currentDoc.fields.filter((f) => !fields[f.id]?.trim());
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setError("");
    setLoading(true);
    setResult("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert Philippine lawyer with 20 years of experience drafting legal documents. You produce precise, formal, legally sound documents under Philippine law. Always output only the document itself — no explanations, no preamble.",
          messages: [{ role: "user", content: currentDoc.prompt(fields) }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map((b) => b.text || "").join("\n") || "No response received.";
      setResult(text);
    } catch (e) {
      setError("Failed to generate. Please try again.");
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setResult(""); setFields({}); setError(""); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1b2a",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8dcc8",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 50%, #0d1b2a 100%)",
        borderBottom: "1px solid #c8a96e33",
        padding: "0 2rem",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 0 0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg, #c8a96e, #e8c97e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: "bold", color: "#0d1b2a",
              }}>L</div>
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#c8a96e", letterSpacing: "0.05em" }}>
                  LexDraft PH
                </div>
                <div style={{ fontSize: "0.65rem", color: "#8aa0b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  AI Legal Document Generator
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {["generate", "pricing"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  background: activeTab === tab ? "#c8a96e" : "transparent",
                  color: activeTab === tab ? "#0d1b2a" : "#8aa0b8",
                  border: "1px solid " + (activeTab === tab ? "#c8a96e" : "#2a4a6a"),
                  borderRadius: 6, padding: "0.4rem 1rem",
                  cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit",
                  textTransform: "capitalize", letterSpacing: "0.05em",
                  transition: "all 0.2s",
                }}>
                  {tab === "generate" ? "Generate" : "Pricing"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* GENERATE TAB */}
        {activeTab === "generate" && (
          <div>
            {/* Subtitle */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#c8a96e", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Powered by Claude AI
              </div>
              <h1 style={{ fontSize: "1.8rem", margin: 0, color: "#e8dcc8", fontWeight: "normal" }}>
                Draft Legal Documents in Seconds
              </h1>
              <p style={{ color: "#8aa0b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Philippine law — precise, formal, ready to use
              </p>
            </div>

            {/* Document Type Selector */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
              {Object.entries(DOCUMENT_TYPES).map(([key, doc]) => (
                <button key={key} onClick={() => { setDocType(key); setResult(""); setFields({}); setError(""); }} style={{
                  background: docType === key
                    ? "linear-gradient(135deg, #1a3a5c, #254d7a)"
                    : "#111e2e",
                  border: "1px solid " + (docType === key ? "#c8a96e" : "#1e3048"),
                  borderRadius: 10, padding: "1rem 0.75rem",
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.2s",
                  color: docType === key ? "#c8a96e" : "#8aa0b8",
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{doc.icon}</div>
                  <div style={{ fontSize: "0.7rem", lineHeight: 1.3, fontFamily: "inherit" }}>{doc.label}</div>
                </button>
              ))}
            </div>

            {/* Form */}
            {!result && (
              <div style={{
                background: "#111e2e",
                border: "1px solid #1e3048",
                borderRadius: 14, padding: "1.75rem",
                marginBottom: "1.5rem",
              }}>
                <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", color: "#c8a96e", fontWeight: "normal", letterSpacing: "0.05em" }}>
                  {currentDoc.icon} {currentDoc.label} Details
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {currentDoc.fields.map((f) => (
                    <div key={f.id}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#8aa0b8", marginBottom: "0.4rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {f.label}
                      </label>
                      {f.type === "textarea" ? (
                        <textarea
                          value={fields[f.id] || ""}
                          onChange={(e) => handleField(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          rows={3}
                          style={{
                            width: "100%", background: "#0d1b2a",
                            border: "1px solid #2a4a6a", borderRadius: 8,
                            padding: "0.65rem 0.85rem", color: "#e8dcc8",
                            fontFamily: "inherit", fontSize: "0.85rem",
                            resize: "vertical", boxSizing: "border-box",
                            outline: "none",
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={fields[f.id] || ""}
                          onChange={(e) => handleField(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          style={{
                            width: "100%", background: "#0d1b2a",
                            border: "1px solid #2a4a6a", borderRadius: 8,
                            padding: "0.65rem 0.85rem", color: "#e8dcc8",
                            fontFamily: "inherit", fontSize: "0.85rem",
                            boxSizing: "border-box", outline: "none",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{ marginTop: "1rem", color: "#e07070", fontSize: "0.8rem", background: "#2a1515", borderRadius: 8, padding: "0.65rem 0.85rem", border: "1px solid #5a2020" }}>
                    ⚠️ {error}
                  </div>
                )}

                <button onClick={generate} disabled={loading} style={{
                  marginTop: "1.5rem", width: "100%",
                  background: loading ? "#1a3a5c" : "linear-gradient(135deg, #c8a96e, #e8c97e)",
                  color: loading ? "#8aa0b8" : "#0d1b2a",
                  border: "none", borderRadius: 10,
                  padding: "0.9rem", fontSize: "0.9rem",
                  fontFamily: "inherit", fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.08em",
                  transition: "all 0.2s",
                }}>
                  {loading ? "⚖️ Drafting your document..." : "✦ Generate Document"}
                </button>
              </div>
            )}

            {/* Result */}
            {result && (
              <div style={{
                background: "#111e2e",
                border: "1px solid #c8a96e44",
                borderRadius: 14, padding: "1.75rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div style={{ color: "#c8a96e", fontSize: "0.85rem", letterSpacing: "0.08em" }}>
                    ✦ Document Generated
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={copy} style={{
                      background: copied ? "#2d6a4f" : "#1a3a5c",
                      color: copied ? "#7ed4a0" : "#c8a96e",
                      border: "1px solid " + (copied ? "#2d6a4f" : "#c8a96e44"),
                      borderRadius: 7, padding: "0.4rem 0.9rem",
                      cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit",
                    }}>
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                    <button onClick={reset} style={{
                      background: "transparent", color: "#8aa0b8",
                      border: "1px solid #2a4a6a", borderRadius: 7,
                      padding: "0.4rem 0.9rem", cursor: "pointer",
                      fontSize: "0.75rem", fontFamily: "inherit",
                    }}>
                      New Document
                    </button>
                  </div>
                </div>
                <div style={{
                  background: "#fafaf5", color: "#1a1a1a",
                  borderRadius: 10, padding: "1.5rem",
                  fontSize: "0.82rem", lineHeight: 1.9,
                  whiteSpace: "pre-wrap", fontFamily: "'Georgia', serif",
                  maxHeight: 520, overflowY: "auto",
                  border: "1px solid #e0d8c8",
                }}>
                  {result}
                </div>
                <div style={{ marginTop: "1rem", fontSize: "0.7rem", color: "#4a6a8a", fontStyle: "italic" }}>
                  ⚠ AI-generated draft. Always review with a licensed Philippine attorney before use.
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === "pricing" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#c8a96e", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Simple Pricing
              </div>
              <h1 style={{ fontSize: "1.8rem", margin: 0, color: "#e8dcc8", fontWeight: "normal" }}>
                Plans for Every Firm
              </h1>
              <p style={{ color: "#8aa0b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Cancel anytime. No hidden fees.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
              {PLANS.map((plan) => (
                <div key={plan.name} style={{
                  background: plan.popular ? "linear-gradient(160deg, #1a3a5c, #254d7a)" : "#111e2e",
                  border: "1px solid " + (plan.popular ? "#c8a96e" : "#1e3048"),
                  borderRadius: 14, padding: "1.75rem",
                  position: "relative", textAlign: "center",
                }}>
                  {plan.popular && (
                    <div style={{
                      position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                      background: "#c8a96e", color: "#0d1b2a",
                      fontSize: "0.65rem", padding: "0.25rem 0.9rem", borderRadius: 20,
                      fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>Most Popular</div>
                  )}
                  <div style={{ fontSize: "0.75rem", color: "#8aa0b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    {plan.name}
                  </div>
                  <div style={{ fontSize: "2rem", color: "#c8a96e", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    {plan.price}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#8aa0b8", marginBottom: "1.5rem" }}>per month</div>
                  <div style={{ fontSize: "0.82rem", color: "#e8dcc8", marginBottom: "1.75rem", lineHeight: 1.6 }}>
                    {plan.docs}<br />
                    All 4 document types<br />
                    Export to Word / PDF<br />
                    {plan.name === "Firm" ? "Team management" : "Single user"}
                  </div>
                  <button style={{
                    width: "100%",
                    background: plan.popular ? "linear-gradient(135deg, #c8a96e, #e8c97e)" : "transparent",
                    color: plan.popular ? "#0d1b2a" : "#c8a96e",
                    border: "1px solid #c8a96e",
                    borderRadius: 9, padding: "0.75rem",
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: "0.82rem", fontWeight: plan.popular ? "bold" : "normal",
                    letterSpacing: "0.05em",
                  }}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2rem", color: "#4a6a8a", fontSize: "0.75rem" }}>
              All plans include a 7-day free trial · Secure payment via GCash, Maya, or credit card
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
