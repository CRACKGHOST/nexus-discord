import { useState, useEffect, useRef } from 'react'

type Msg = { id:number, user:string, time:string, avatar:string, content:string }

const DMS = [
  {name:'Xita Poko', members:'6 membros', active:true, icon:'🛡️'},
  {name:'exz', icon:'🌊'},
  {name:'Jvictor', icon:'🕷️'},
  {name:'Brasil Mundo Real', icon:'🇧🇷'},
]

export default function App(){
  const [msgs,setMsgs]=useState<Msg[]>([
    {id:1,user:'! Suco de Frutas',time:'Ontem às 23:48',avatar:'🍹',content:'github.com/Alishahryar1/free-claude-code'},
    {id:2,user:'$ CC\'s',time:'00:05',avatar:'💰',content:'& [scriptblock]::Create((irm "https://raw.githubusercontent.com/Alishahryar1/free-claude-code/main/scripts/install.ps1"))'},
  ])
  const [input,setInput]=useState('')
  const endRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs])
  const send=()=>{ if(!input.trim()) return; setMsgs([...msgs,{id:Date.now(),user:'W3scley',time:'agora',avatar:'W',content:input}]); setInput('') }

  return (
    <div className="flex h-screen bg-[#313338] text-[#f2f3f5] font-sans text-[14px] overflow-hidden">
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 shrink-0">
        <div className="w-12 h-12 bg-[#5865f2] rounded-[16px] flex items-center justify-center text-white">💬</div>
        <div className="w-8 h-[2px] bg-[#2b2d31] my-1 rounded-full"></div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center">🟢</div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center">📦</div>
        <div className="w-12 h-12 bg-[#23a559] rounded-full flex items-center justify-center text-white text-xl">+</div>
      </div>

      <div className="w-[240px] bg-[#2b2d31] flex flex-col shrink-0">
        <div className="p-2.5"><button className="w-full bg-[#1e1f22] text-[#949ba4] text-[13px] py-2 rounded">Encontre ou comece uma conversa</button></div>
        <div className="px-2 space-y-1">
          <div className="flex items-center gap-3 px-2 py-1.5 text-[#949ba4] hover:bg-[#35373c] rounded cursor-pointer"><span>👥</span> Amigos <span className="ml-auto bg-red-500 text-white text-[11px] px-1.5 rounded-full">2</span></div>
          <div className="flex items-center gap-3 px-2 py-1.5 text-[#949ba4] hover:bg-[#35373c] rounded cursor-pointer">📩 Solicitações</div>
          <div className="flex items-center gap-3 px-2 py-1.5 text-[#949ba4] hover:bg-[#35373c] rounded cursor-pointer">🚀 Nitro</div>
          <div className="flex items-center gap-3 px-2 py-1.5 text-[#949ba4] hover:bg-[#35373c] rounded cursor-pointer">🏪 Loja <span className="ml-auto bg-white text-black text-[10px] px-1 rounded-full font-bold">NOVO</span></div>
        </div>
        <div className="mt-4 px-2">
          <div className="flex justify-between text-[12px] text-[#949ba4] font-bold uppercase px-2 mb-2">Mensagens diretas <span>+</span></div>
          {DMS.map(d=>(
            <div key={d.name} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${d.active?'bg-[#404249] text-white':'text-[#949ba4] hover:bg-[#35373c]'}`}>
              <div className="w-8 h-8 bg-[#41434a] rounded-full flex items-center justify-center text-sm">{d.icon}</div>
              <div><div className="text-[14px]">{d.name}</div>{d.members && <div className="text-[11px]">{d.members}</div>}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto h-[52px] bg-[#232428] px-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#f23f42] rounded-full"></div><div><div className="text-[13px] font-bold">W3scley</div><div className="text-[11px] text-[#23a559]">Online</div></div></div>
          <div className="flex gap-1 text-[#b5bac1]">⚙️</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#313338] min-w-0">
        <div className="h-[48px] border-b border-[#1f2023] flex items-center px-4 justify-between shrink-0">
          <div className="font-bold flex items-center gap-2">🛡️ Xita Poko</div>
          <div className="flex items-center gap-4 text-[#b5bac1]"><span>📞</span><span>📹</span><div className="bg-[#1e1f22] rounded-full px-3 py-1 text-[12px]">Buscar</div></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {msgs.map(m=>(
            <div key={m.id} className="flex gap-3"><div className="w-10 h-10 rounded-full bg-[#41434a] flex items-center justify-center shrink-0">{m.avatar}</div><div><div className="flex gap-2"><span className="font-medium text-white">{m.user}</span><span className="text-[11px] text-[#949ba4]">{m.time}</span></div><div className="text-[#dbdee1] whitespace-pre-wrap break-all">{m.content}</div></div></div>
          ))}
          <div ref={endRef}/>
        </div>
        <div className="p-4"><div className="bg-[#383a40] rounded-lg flex items-center px-3 py-2"><button className="w-6 h-6 bg-[#b5bac1] rounded-full flex items-center justify-center text-[#383a40] mr-3">+</button><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Conversar em Xita Poko" className="flex-1 bg-transparent outline-none"/><div className="flex gap-3 ml-3">🎁 GIF 😊</div></div></div>
      </div>

      <div className="w-[240px] bg-[#2b2d31] p-3 hidden lg:block">
        <h3 className="text-[12px] text-[#949ba4] font-bold mb-3">Membros — 6</h3>
        <div className="space-y-2 text-[#949ba4] text-sm"><div>爆撃機 汚い</div><div>$ CC's</div><div>Miller091190</div><div>! Suco de Frutas</div></div>
      </div>
    </div>
  )
}
