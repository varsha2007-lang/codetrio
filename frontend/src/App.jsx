import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, ChevronRight, CircleHelp, ClipboardCheck, CreditCard, ExternalLink, Eye, FileSearch, Headphones, Home, Menu, MessageCircle, Mic2, Shield, ShieldCheck, Sparkles, Volume2, X } from 'lucide-react'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'
const pages = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'analyzer', label: 'Scam Analyzer', icon: FileSearch },
  { id: 'payment', label: 'Payment Checker', icon: CreditCard },
  { id: 'assistant', label: 'Safety Assistant', icon: MessageCircle },
  { id: 'learn', label: 'Learn Safety', icon: BookOpen },
]
const examples = [
  { label: 'Urgent OTP request', text: 'URGENT: Your bank account will be suspended today. Reply with the OTP you just received to keep it active.' },
  { label: 'Prize + QR code', text: 'Congratulations, you won a ₹25,000 reward! Scan this QR code now to claim your prize.' },
  { label: 'Ordinary bill reminder', text: 'Reminder: Your electricity bill of ₹850 is due on 25 October. Please pay using your usual method.' },
]

async function request(path, body) {
  const response = await fetch(`${API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'We could not complete that request. Please try again.')
  return data
}

function App() {
  const [page, setPage] = useState('home')
  const [mobileNav, setMobileNav] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')
  useEffect(() => {
    request('/health').then(() => setApiStatus('online')).catch(() => setApiStatus('offline'))
  }, [])
  const navigate = (next) => { setPage(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const current = pages.find((item) => item.id === page) || pages[0]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`} aria-label="Main navigation">
      <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); navigate('home') }}>
        <span className="brand-mark"><ShieldCheck size={23} strokeWidth={2.3} /></span>
        <span><strong>PayGuard <span>AI</span></strong><small>PAYMENT CONFIDENCE</small></span>
      </a>
      <div className="nav-label">YOUR SAFETY TOOLS</div>
      <nav className="nav-list">
        {pages.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => navigate(id)} aria-current={page === id ? 'page' : undefined}>
          <Icon size={19} aria-hidden="true" /><span>{label}</span>{page === id && <ChevronRight className="nav-chevron" size={16} />}
        </button>)}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-help"><div className="help-icon"><Headphones size={19} /></div><strong>Need a moment?</strong><p>It’s always okay to pause and ask someone you trust.</p><button onClick={() => navigate('assistant')}>Ask for guidance <ArrowRight size={15} /></button></div>
      <div className="sidebar-foot"><span className={`status-dot ${apiStatus}`} />{apiStatus === 'online' ? 'Safety tools connected' : apiStatus === 'checking' ? 'Connecting to safety tools' : 'Offline mode · checker & quiz work'}</div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu icon-button" aria-label={mobileNav ? 'Close menu' : 'Open menu'} onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X size={21} /> : <Menu size={21} />}</button>
        <div className="breadcrumb"><span>PayGuard AI</span><ChevronRight size={15} /><strong>{current.label}</strong></div>
        <div className="topbar-right"><span className="privacy-pill"><Shield size={14} /> Private by design</span><div className="avatar" aria-label="Your safety space">PG</div></div>
      </header>
      <div className="content-wrap">
        {page === 'home' && <HomePage navigate={navigate} />}
        {page === 'analyzer' && <AnalyzerPage />}
        {page === 'payment' && <PaymentPage />}
        {page === 'assistant' && <AssistantPage />}
        {page === 'learn' && <LearnPage />}
      </div>
      <footer className="page-footer"><span>PayGuard AI is an advisory tool—not a guarantee.</span><span>Never share your PIN, OTP, or password. <a href="#assistant" onClick={(event) => { event.preventDefault(); navigate('assistant') }}>Get safe guidance <ArrowRight size={13} /></a></span></footer>
    </main>
  </div>
}

function PageIntro({ eyebrow, title, text, icon: Icon }) {
  return <div className="page-intro"><div className="intro-icon"><Icon size={23} /></div><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div></div>
}
function HomePage({ navigate }) {
  const cards = [
    { id: 'analyzer', icon: FileSearch, title: 'Check a message', text: 'Understand warning signs in a text, email, or payment request.', cta: 'Analyze a message', tone: 'mint' },
    { id: 'payment', icon: CreditCard, title: 'Review a payment', text: 'Double-check the amount and recipient before you pay.', cta: 'Check payment details', tone: 'blue' },
    { id: 'assistant', icon: MessageCircle, title: 'Ask a question', text: 'Get simple guidance for everyday digital payment worries.', cta: 'Talk to the assistant', tone: 'lavender' },
    { id: 'learn', icon: BookOpen, title: 'Learn at your pace', text: 'Practice spotting common scams with five quick scenarios.', cta: 'Start learning', tone: 'peach' },
  ]
  return <>
    <section className="welcome-hero"><div className="hero-copy"><div className="eyebrow light">A CALMER WAY TO PAY</div><h1>PayGuard AI</h1><p className="hero-subtitle">Your intelligent assistant for safer digital payments.</p><p className="hero-description">A little pause can make a big difference. Get clear, friendly guidance before you act.</p><button className="button button-primary hero-button" onClick={() => navigate('analyzer')}>Check a suspicious message <ArrowRight size={17} /></button><div className="tagline"><span>Pause.</span><span>Understand.</span><span>Verify.</span><span>Pay Safely.</span></div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-shield"><ShieldCheck size={82} strokeWidth={1.5} /></div><div className="art-note note-top"><span className="note-check"><Check size={13} /></span> Take your time</div><div className="art-note note-bottom"><span className="note-lock"><Shield size={13} /></span> Your safety comes first</div><div className="art-star"><Sparkles size={22} /></div></div></section>
    <div className="section-heading"><div><div className="eyebrow">YOUR SAFETY TOOLKIT</div><h2>How can we help today?</h2></div><span className="offline-note"><span className="green-check"><Check size={12} /></span> No real payments are ever made here</span></div>
    <section className="feature-grid" aria-label="Safety tools">{cards.map(({ id, icon: Icon, title, text, cta, tone }) => <button key={id} className="feature-card" onClick={() => navigate(id)}><span className={`feature-icon ${tone}`}><Icon size={21} /></span><span className="card-title">{title}</span><span className="card-description">{text}</span><span className="card-cta">{cta}<ArrowRight size={15} /></span></button>)}</section>
    <section className="trust-strip"><div className="trust-icon"><ShieldCheck size={21} /></div><div><strong>Advice, not a verdict</strong><p>A warning sign is a reason to verify—not proof of fraud. No warning sign is not proof that a message is safe.</p></div><button className="text-button" onClick={() => navigate('learn')}>Learn safe habits <ArrowRight size={15} /></button></section>
  </>
}

function AnalyzerPage() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sample, setSample] = useState('')
  const textarea = useRef(null)
  async function analyze(event) {
    event.preventDefault()
    if (!message.trim()) { setError('Paste or type a message first.'); textarea.current?.focus(); return }
    setLoading(true); setError(''); setResult(null)
    try { setResult(await request('/analyze-message', { message })) }
    catch (err) { setError(err.name === 'TimeoutError' ? 'The analysis took too long. Please try again, or use the payment checker and learning quiz offline.' : err.message) }
    finally { setLoading(false) }
  }
  const riskTone = result?.risk_category === 'High Concern' ? 'high' : result?.risk_category === 'Needs Verification' ? 'medium' : 'low'
  return <>
    <PageIntro eyebrow="MESSAGE SAFETY" title="Scam Analyzer" text="Paste a message you’re unsure about. We’ll help you notice details worth checking." icon={FileSearch} />
    <div className="advisory-banner"><Shield size={17} /><span><strong>Your message is treated as untrusted text.</strong> Analysis is advisory only. No single word proves a scam, and no result guarantees safety.</span></div>
    <div className="analyzer-layout"><section className="panel input-panel"><div className="panel-heading"><div><h2>What did you receive?</h2><p>Paste the message exactly as it appeared. Don’t add private information.</p></div><span className="step-mark">01</span></div>
      <div className="examples"><span className="field-label">TRY AN EXAMPLE</span><div className="example-buttons">{examples.map((item) => <button key={item.label} className={`example-chip ${sample === item.label ? 'selected' : ''}`} onClick={() => { setMessage(item.text); setSample(item.label); setResult(null); setError('') }}>{item.label}</button>)}</div></div>
      <form onSubmit={analyze}><label className="field-label" htmlFor="message-input">MESSAGE TEXT</label><textarea id="message-input" ref={textarea} value={message} maxLength={5000} onChange={(event) => { setMessage(event.target.value); setSample('') }} placeholder="Paste a text message, email, or payment request here…" rows={7} aria-describedby="message-help" /><div className="field-meta"><span id="message-help">Up to 5,000 characters. Please remove personal details.</span><span>{message.length}/5000</span></div>
        {error && <div className="inline-error" role="alert"><CircleHelp size={16} />{error}</div>}
        <button className="button button-primary full-button" type="submit" disabled={loading}>{loading ? <><span className="spinner" /> Checking the message…</> : <><Sparkles size={17} /> Check for warning signs</>}</button>
      </form><div className="privacy-note"><Shield size={14} /> Messages aren’t logged by the app. Avoid sharing sensitive details.</div>
    </section>
    <section className="result-column" aria-live="polite">{loading ? <div className="panel loading-panel"><span className="large-spinner" /><h3>Taking a careful look…</h3><p>Checking the message for common warning signs.</p></div> : result ? <div className="panel result-panel"><div className={`risk-heading ${riskTone}`}><div className="risk-symbol" aria-hidden="true">{riskTone === 'high' ? '!' : riskTone === 'medium' ? '?' : '✓'}</div><div><span className="field-label">ADVISORY RESULT</span><h2>{result.risk_category}</h2></div></div>
      <div className={`status-label ${result.analysis_status === 'AI analysis complete' ? 'ai-good' : 'ai-fallback'}`}><span className="status-dot" />{result.analysis_status}</div>
      <p className="result-explanation">{result.explanation}</p>
      {result.warning_signs?.length > 0 ? <div className="result-section"><h3>What may need a closer look</h3><ul className="finding-list">{result.warning_signs.map((sign, index) => <li key={`${sign}-${index}`}><span className="finding-mark">!</span><div><strong>{sign}</strong>{result.evidence_from_message?.[index] && <blockquote>“{result.evidence_from_message[index]}”</blockquote>}</div></li>)}</ul></div> : <div className="no-findings"><BadgeCheck size={18} /><span>No listed warning pattern was detected. Still verify unexpected requests independently.</span></div>}
      <div className="result-section"><h3>Safer next steps</h3><ul className="action-list">{result.recommended_actions?.map((action) => <li key={action}><Check size={15} />{action}</li>)}</ul></div><div className="tip-box"><strong>Remember</strong><p>{result.educational_tip}</p></div><p className="limitations">{result.limitations}</p>
    </div> : <div className="panel result-empty"><div className="empty-illustration"><Eye size={34} /></div><h3>Your review will appear here</h3><p>Choose an example or paste a message to begin. We’ll explain any warning signs in plain language.</p><div className="empty-points"><span><Check size={14} /> No verdicts or guarantees</span><span><Check size={14} /> Clear next steps</span></div></div>}</section></div>
  </>
}

function PaymentPage() {
  const [intended, setIntended] = useState('')
  const [entered, setEntered] = useState('')
  const [recipient, setRecipient] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const intendedRef = useRef(null); const recipientRef = useRef(null)
  async function check(event) {
    event?.preventDefault()
    if (!intended.trim() || !entered.trim()) { setError('Please enter both the amount you intended and the amount shown.'); setResult(null); return }
    if (!/^\d+(?:\.\d{1,2})?$/.test(intended.replace(/,/g, '').trim()) || !/^\d+(?:\.\d{1,2})?$/.test(entered.replace(/,/g, '').trim())) { setError('Enter a valid non-negative amount, such as 500 or 125.50.'); setResult(null); return }
    setError(''); setLoading(true)
    try { setResult(await request('/check-payment', { intended_amount: intended, entered_amount: entered, recipient_name: recipient })) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  return <><PageIntro eyebrow="BEFORE YOU SEND" title="Payment Checker" text="A quick second look can help catch a typo or the wrong recipient. No payments are made here." icon={CreditCard} />
    <div className="advisory-banner"><Shield size={17} /><span><strong>This tool never moves money.</strong> Always confirm details in your trusted payment app before approving.</span></div>
    <div className="payment-layout"><section className="panel payment-form-panel"><div className="panel-heading"><div><h2>Compare payment details</h2><p>Check what you planned against what’s on your screen.</p></div><span className="step-mark">01</span></div>
      <form onSubmit={check}><div className="amount-pair"><div className="input-field"><label htmlFor="intended">I intended to pay</label><div className="currency-input"><span>₹</span><input ref={intendedRef} id="intended" inputMode="decimal" value={intended} onChange={(event) => setIntended(event.target.value)} placeholder="e.g. 500" /></div></div><div className="pair-arrow"><ArrowRight size={18} /></div><div className="input-field"><label htmlFor="entered">Amount entered</label><div className="currency-input"><span>₹</span><input id="entered" inputMode="decimal" value={entered} onChange={(event) => setEntered(event.target.value)} placeholder="e.g. 5,000" /></div></div></div>
        <div className="input-field recipient-field"><label htmlFor="recipient">Recipient name <span className="optional-tag">RECOMMENDED</span></label><input ref={recipientRef} id="recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Who are you paying?" /></div>
        {error && <div className="inline-error" role="alert"><CircleHelp size={16} />{error}</div>}
        <button className="button button-primary full-button" type="submit" disabled={loading}>{loading ? <><span className="spinner" /> Comparing details…</> : <><ClipboardCheck size={17} /> Check these details</>}</button>
      </form>
    </section><section className="panel payment-result" aria-live="polite">{loading ? <div className="loading-panel"><span className="large-spinner" /><h3>Checking the numbers…</h3></div> : result ? <><div className={`payment-status ${result.warning ? 'needs-review' : 'looks-matched'}`}><span className="status-badge">{result.warning ? '!' : <Check size={20} />}</span><div><span className="field-label">PAYMENT REVIEW</span><h2>{result.warning ? 'Please review before paying' : 'Amounts match'}</h2></div></div>
      {result.warnings.length ? <ul className="payment-warning-list">{result.warnings.map((warning) => <li key={warning}><span aria-hidden="true">!</span>{warning}</li>)}</ul> : <p className="payment-success-copy">The amount you intended matches the amount entered. Please still confirm the recipient and details in your payment app.</p>}
      <div className="payment-actions"><button className="button button-secondary" onClick={() => { intendedRef.current?.focus(); intendedRef.current?.select() }}>Edit Amount</button><button className="button button-secondary" onClick={() => { recipientRef.current?.focus() }}>Review Recipient</button><button className="button button-primary" onClick={check}>Check Again</button></div><p className="no-payment-note"><Shield size={14} /> This is a check only. It cannot approve or make a payment.</p>
    </> : <div className="empty-payment"><div className="empty-illustration"><CreditCard size={31} /></div><h3>Ready when you are</h3><p>Enter both amounts and the recipient. We’ll flag differences, including an extra zero.</p></div>}</section></div>
    <section className="trust-strip slim"><div className="trust-icon"><Eye size={20} /></div><div><strong>Try a quick example</strong><p>Intended ₹500 · Entered ₹5,000 — spot the extra zero before continuing.</p></div><button className="text-button" onClick={() => { setIntended('500'); setEntered('5000'); setRecipient('Ravi Kumar'); setResult(null); setError('') }}>Load example <ArrowRight size={15} /></button></section>
  </>
}

function AssistantPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function ask(event) {
    event.preventDefault()
    if (!question.trim()) { setError('Type a question first.'); return }
    setError(''); setLoading(true); setAnswer(null)
    try { setAnswer(await request('/ask-safety', { question })) }
    catch (err) { setError(err.name === 'TimeoutError' ? 'That took too long. Please try again.' : err.message) }
    finally { setLoading(false) }
  }
  function speak() {
    if (!answer?.answer || !('speechSynthesis' in window)) { setError('Text-to-speech is not available in this browser.'); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(answer.answer)
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }
  return <><PageIntro eyebrow="FRIENDLY GUIDANCE" title="Safety Assistant" text="Ask a simple question about paying safely. There are no silly questions." icon={MessageCircle} />
    <div className="assistant-layout"><section className="assistant-intro-card"><div className="assistant-orb"><MessageCircle size={30} /></div><div className="eyebrow light">HERE TO HELP</div><h2>Let’s figure it out<br />together.</h2><p>Get calm, easy-to-understand tips for digital payment questions.</p><div className="assistant-promise"><ShieldCheck size={17} /><span>We will never ask you for a PIN, OTP, or password.</span></div></section>
    <section className="panel assistant-chat"><div className="chat-top"><span className="assistant-avatar"><Sparkles size={17} /></span><div><strong>PayGuard guide</strong><span>General safety guidance</span></div><span className="online-indicator">● Ready</span></div>
      <div className="chat-welcome"><div className="mini-bot"><ShieldCheck size={18} /></div><div className="chat-bubble"><strong>Namaste! How can I help?</strong><p>Ask me how to check a payment, what to do about a suspicious message, or how to stay safe online.</p></div></div>
      <div className="suggested-questions"><span className="field-label">SOME THINGS YOU CAN ASK</span><div>{['Someone asked for my OTP. What should I do?', 'How can I check if a payment went through?', 'I scanned a QR code by mistake. What now?'].map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}<ChevronRight size={14} /></button>)}</div></div>
      {answer && <div className="answer-card" aria-live="polite"><div className="answer-heading"><strong>Your guidance</strong><button className="speak-button" onClick={speak} aria-label="Read answer aloud"><Volume2 size={16} /> Read aloud</button></div><p>{answer.answer}</p><span className={`status-label ${answer.analysis_status === 'AI answer' ? 'ai-good' : 'ai-fallback'}`}><span className="status-dot" />{answer.analysis_status}</span><p className="answer-reminder"><Shield size={14} />{answer.safety_reminder}</p></div>}
      {error && <div className="inline-error" role="alert">{error}</div>}
      <form className="question-form" onSubmit={ask}><label className="sr-only" htmlFor="question">Ask a safety question</label><textarea id="question" rows={2} maxLength={2000} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Type your question here…" /><button className="button button-primary ask-button" disabled={loading}>{loading ? <><span className="spinner" /> Thinking…</> : <>Ask <ArrowRight size={16} /></>}</button></form><div className="chat-disclaimer"><Shield size={13} />For account-specific help, use your bank’s official app or the number on your card.</div>
    </section></div>
    <div className="speech-note"><Mic2 size={16} /> Answers can be read aloud using your browser’s text-to-speech. Voice input is not enabled.</div>
  </>
}

function LearnPage() {
  const [scenarios, setScenarios] = useState([])
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => { request('/learning-scenarios').then(setScenarios).catch(() => setScenarios(localScenarios)) }, [])
  const scenario = scenarios[index]
  const finished = scenarios.length > 0 && index >= scenarios.length
  function submit() { if (choice === null) { setError('Choose an answer to continue.'); return } setError(''); setAnswered(true); if (choice === scenario.correct_index) setScore(score + 1) }
  function next() { setIndex(index + 1); setChoice(null); setAnswered(false); setError('') }
  function restart() { setIndex(0); setChoice(null); setAnswered(false); setScore(0); setError('') }
  return <><PageIntro eyebrow="PRACTICE & LEARN" title="Learn Safety" text="Build confidence one small step at a time. These five practice scenarios work offline." icon={BookOpen} />
    <div className="quiz-topline"><div><span className="field-label">YOUR PRACTICE ROUND</span><h2>Spot it. Pause. Stay safe.</h2></div><div className="score-pill"><span><Sparkles size={15} /></span>Score <strong>{score}</strong></div></div>
    {finished ? <section className="panel quiz-finish"><div className="finish-icon"><BadgeCheck size={34} /></div><div className="eyebrow">ROUND COMPLETE</div><h2>{score === 5 ? 'Fantastic work!' : 'Good practice!'}</h2><p>You got <strong>{score} out of {scenarios.length}</strong> correct. Keep these habits in mind the next time you make a digital payment.</p><div className="finish-lessons"><span><Check size={14} /> Never share an OTP</span><span><Check size={14} /> Verify in official apps</span><span><Check size={14} /> Check amount and recipient</span></div><button className="button button-primary" onClick={restart}>Practice again <ArrowRight size={16} /></button></section> : scenario && <section className="quiz-layout"><div className="quiz-progress-panel"><div className="quiz-progress-caption"><span>SCENARIO {index + 1} OF {scenarios.length}</span><span>{Math.round((index / scenarios.length) * 100)}% complete</span></div><div className="progress-track" aria-label={`Scenario ${index + 1} of ${scenarios.length}`}><span style={{ width: `${(index / scenarios.length) * 100}%` }} /></div><div className="scenario-message"><span className="message-type"><MessageCircle size={14} /> MESSAGE RECEIVED</span><h3>{scenario.title}</h3><blockquote>“{scenario.message}”</blockquote><p>What is the safest thing to do?</p></div><div className="scenario-tip"><ShieldCheck size={17} /><span>There’s no rush. Take a moment to think before choosing.</span></div></div>
      <div className="panel answer-options"><span className="field-label">CHOOSE ONE ANSWER</span><div className="choice-list" role="radiogroup" aria-label="Answer choices">{scenario.choices.map((option, optionIndex) => <button key={option} role="radio" aria-checked={choice === optionIndex} className={`choice-option ${choice === optionIndex ? 'chosen' : ''} ${answered && optionIndex === scenario.correct_index ? 'correct-choice' : ''} ${answered && choice === optionIndex && choice !== scenario.correct_index ? 'wrong-choice' : ''}`} onClick={() => !answered && setChoice(optionIndex)} disabled={answered}><span className="choice-marker">{answered && optionIndex === scenario.correct_index ? <Check size={15} /> : String.fromCharCode(65 + optionIndex)}</span>{option}{answered && optionIndex === scenario.correct_index && <span className="answer-tag">SAFEST CHOICE</span>}</button>)}</div>
        {answered && <div className={`quiz-feedback ${choice === scenario.correct_index ? 'correct' : 'incorrect'}`} role="status"><strong>{choice === scenario.correct_index ? 'That’s right!' : 'A safer choice is available.'}</strong><p>{scenario.explanation}</p></div>}
        {error && <div className="inline-error" role="alert">{error}</div>}
        {!answered ? <button className="button button-primary full-button" onClick={submit}>Check my answer <ArrowRight size={16} /></button> : <button className="button button-primary full-button" onClick={next}>{index + 1 === scenarios.length ? 'See my score' : 'Next scenario'} <ArrowRight size={16} /></button>}
        <div className="quiz-back"><button className="text-button" onClick={restart}><ArrowLeft size={14} /> Start this round over</button><span>Practice only · No personal details</span></div>
      </div></section>}
    <div className="quiz-footer-note"><BookOpen size={16} /><span>Learning scenarios are examples for practice. Real situations can be different—when unsure, contact your bank through an official channel.</span></div>
  </>
}

const localScenarios = [
  { id: 'cashback', title: 'Too-good-to-be-true cashback', message: 'Claim 90% cashback now! Install this app and pay a small verification fee.', choices: ['Pay the fee to unlock cashback', 'Pause and check the offer on the official app', 'Forward it to friends'], correct_index: 1, explanation: 'Unexpected rewards and upfront fees are warning signs. Verify offers in the official bank or merchant app.' },
  { id: 'otp', title: 'OTP request with a threat', message: 'Your account will be suspended. Tell our agent the OTP you just received.', choices: ['Share the OTP so the account stays open', 'Never share it; contact the bank through its official channel', 'Reply asking for more time'], correct_index: 1, explanation: 'A legitimate support agent should not ask you to disclose an OTP, PIN, or password.' },
  { id: 'qr', title: 'Suspicious QR instruction', message: 'Scan this QR to receive your refund. Enter your PIN to confirm.', choices: ['Scan it and enter the PIN', 'Do not scan; verify through the official merchant channel', 'Send the QR to a group chat'], correct_index: 1, explanation: 'A QR code can start a payment or open an unsafe destination. You generally do not need to enter a PIN to receive money.' },
  { id: 'screenshot', title: 'Payment screenshot as proof', message: 'Here is my payment screenshot. Give me the item now; the transfer is complete.', choices: ['Trust the screenshot', 'Check the transaction in your own bank/payment app', 'Share your login to confirm'], correct_index: 1, explanation: 'Screenshots can be edited or refer to a failed/pending payment. Check your own account activity.' },
  { id: 'zeros', title: 'An extra zero', message: 'You meant to pay ₹500 but the amount field shows ₹5,000.', choices: ['Pay quickly before it expires', 'Stop and correct the amount, then review the recipient', 'Assume the app will fix it'], correct_index: 1, explanation: 'Read the amount digit by digit and confirm the recipient before approving any payment.' },
]

export default App
