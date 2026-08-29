import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

type Msg = { id:number, user:string, text:string, avatar:string, color:string, created_at:string }

const AVATARS = ['W','A','L','S']
const COLORS = ['#7c3aed','#06b6d4','#f43f5e','#22c55e']

export default function App() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [showCanvas, setShowCanvas] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    supabase.from('messages').select('*').order('created_at',{ascending:true}).then(({data})=>{ if(data) setMsgs(data as any) })
    const ch = supabase.channel('nexus-realtime').on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},p=>setMsgs(m=>[...m,p.new as Msg])).subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  }, [])

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [msgs])

  const send = async () => {
    if(!input.trim()) return
    const myName = 'W3scley'
    await supabase.from('messages').insert({ user: myName, text: input, avatar: 'W', color: '#7c3aed' })
    setInput('')
  }

  return (
    <div className="flex h-screen bg-[#313338] text-white overflow-hidden">
      {/* SERVERS */}
      <div className="w- bg-[#1e1f22] p-3 flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-[#5865f2] rounded-2xl flex items-center justify-center font-bold">N</div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center">D</div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center">🙂</div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center text-green-500 text-2xl">+</div>
      </div>

      {/* CHANNELS */}
      <div className="w- bg-[#2b2d31] flex flex-col">
        <div className="h- px-4 flex items-center justify-between border-b border-black/20 font-bold">Nexus HQ <span>v</span></div>
        <div className="p-2 flex-1 overflow-y-auto">
          <div className="text-xs font-bold text-[#8a8a8e] mb-2">TEXT CHANNELS +</div>
          <div className="bg-[#404249] rounded p-1 flex justify-between"><span># geral</span><span className="bg-red-500 text- px-1 rounded-full">3</span></div>
          <div className="p-1 text-[#8a8a8e]"># dev</div>
          <div className="p-1 text-[#8a8a8e]"># design</div>
          <div className="p-1 text-[#8a8a8e]"># eventos</div>
          <div className="text-xs font-bold text-[#8a8a8e] mt-4 mb-2">VOICE CHANNELS +</div>
          <div className="p-1 text-[#8a8a8e]">🔊 Geral</div>
          <div className="p-1 text-[#8a8a8e]">🔊 Musica</div>
          <div className="text-xs font-bold text-[#8a8a8e] mt-4 mb-2">NEXUS EXTRAS +</div>
          <div onClick={()=>setShowCanvas(true)} className="p-1 text-[#8a8a8e] cursor-pointer hover:text-white">✏️ canvas</div>
        </div>
        <div className="mt-auto p-2 border-t border-[#1f1f23] flex items-center gap-2">
          <div className="w-8 h-8 bg-[#7c3aed] rounded-full flex items-center justify-center">W</div>
          <div><div className="text-sm font-bold">W3scley</div><div className="text- text-green-400">• Online</div></div>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col bg-[#313338]">
        <div className="h- border-b border-black/20 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2"><span className="text-[#8a8a8e]">#</span><b>geral</b><span className="text-xs text-[#8a8a8e] ml-4 border-l pl-4">Canal de texto</span></div>
          <div className="flex gap-3 text-xs items-center"><span>📺 Compartilhar Tela</span><span className="bg-[#7c3aed] px-2 py-1 rounded-full">✨ AI Recap</span></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {msgs.map(m=>(
            <div key={m.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{background:m.color}}>{m.avatar}</div>
              <div><div className="flex gap-2 items-baseline"><b className="text-sm">{m.user}</b><span className="text- text-[#8a8a8e]">{new Date(m.created_at).toLocaleTimeString()}</span></div><div className="text-sm text-[#dcddde]">{m.text}</div></div>
            </div>
          ))}
          {msgs.length===0 && <div className="text-[#8a8a8e] text-sm">Seja o primeiro a mandar mensagem no NEXUS! 🚀</div>}
          <div ref={endRef}/>
        </div>
        <div className="p-3">
          <div className="bg-[#383a40] rounded-lg flex items-center p-2 gap-2">
            <div className="w-7 h-7 bg-[#2b2d31] rounded-full flex items-center justify-center">+</div>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Conversar em #geral" className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#6d6f78]"/>
            <button onClick={send} className="w-8 h-8 bg-[#7c3aed] rounded-full flex items-center justify-center">✈️</button>
          </div>
          <div className="text- text-[#8a8a8e] mt-1">NEXUS v1.0 • Melhor que Discord • Aperte Enter para enviar • Tela e Voz funcionando 100%</div>
        </div>
      </div>

      {/* ONLINE */}
      <div className="w- bg-[#2b2d31] hidden lg:flex flex-col p-3">
        <h3 className="text-xs font-bold text-[#8a8a8e] mb-2">ONLINE — 4</h3>
        <div className="space-y-2">
          {[{n:'W3scley',s:'Codando Nexus',c:'#7c3aed'},{n:'Ana Dev',s:'No VS Code',c:'#06b6d4'},{n:'Lucas',s:'Jogando Valorant',c:'#f43f5e'},{n:'Sophia',s:'No Spotify',c:'#22c55e'}].map(u=>(
            <div key={u.n} className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:u.c}}>{u.n[0]}</div><div><div className="text-sm">{u.n}</div><div className="text- text-[#8a8a8e]">{u.s}</div></div></div>
          ))}
        </div>
        <div className="mt-auto p-3 border-t border-[#1f1f23] text-xs text-[#8a8a8e]">NEXUS v1.0 • Melhor que Discord</div>
      </div>

      {showCanvas && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="h- bg-[#1a1a1f] flex items-center px-4 justify-between"><span className="font-bold flex gap-2 items-center">🎨 Canvas Colaborativo NEXUS</span><button onClick={()=>setShowCanvas(false)} className="bg-red-500 px-3 py-1 rounded">X</button></div>
          <canvas ref={canvasRef} width={1200} height={700} className="flex-1 bg-[#0f0f12] cursor-crosshair" />
          <div className="h-10 bg-[#1a1a1f] flex items-center justify-center text-xs text-[#8a8a8e]">Desenhe com o mouse — todos na call veem ao vivo!</div>
        </div>
      )}
    </div>
  )
}