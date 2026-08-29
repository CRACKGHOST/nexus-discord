import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

type Message = {
  id: number
  user: string
  text: string
  avatar: string
  color: string
  created_at: string
}

const AVATARS = ['😎','🔥','👑','💀','🤖','👾','🎃','🦊']
const COLORS = ['#5865F2','#EB459E','#57F287','#FEE75C','#ED4245','#00D166']

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [username] = useState(() => 'CRACKGHOST_' + Math.floor(Math.random()*999))
  const [avatar] = useState(() => AVATARS[Math.floor(Math.random()*AVATARS.length)])
  const [color] = useState(() => COLORS[Math.floor(Math.random()*COLORS.length)])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // carregar antigas
    supabase.from('messages').select('*').order('created_at', { ascending: true }).then(({ data }) => {
      if (data) setMessages(data as any)
    })

    // tempo real
    const channel = supabase.channel('messages-channel')
     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
     .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim()) return
    const msg = { user: username, text: input, avatar, color }
    setInput('')
    await supabase.from('messages').insert(msg)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#313338', color: 'white', fontFamily: 'gg sans, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: '#2B2D31', padding: 16 }}>
        <h2 style={{ fontWeight: 800 }}>NEXUS DISCORD</h2>
        <div style={{ marginTop: 20, color: '#949BA4' }}># geral</div>
        <div style={{ marginTop: 12, fontSize: 12 }}>Online: {messages.length} msgs</div>
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, background: '#232428', padding: 8, borderRadius: 8 }}>
          <span style={{ background: color, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{avatar}</span>
          <b>{username}</b>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ background: m.color, width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.avatar}</div>
              <div>
                <b style={{ color: m.color }}>{m.user}</b> <span style={{ color: '#949BA4', fontSize: 12 }}>{new Date(m.created_at).toLocaleTimeString()}</span>
                <div style={{ marginTop: 2 }}>{m.text}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', background: '#383A40', borderRadius: 8, padding: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={`Mensagem em #geral como ${username}`} style={{ flex: 1, background: 'transparent', border: 0, color: 'white', outline: 'none' }} />
            <button onClick={send} style={{ background: '#5865F2', border: 0, color: 'white', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  )
}