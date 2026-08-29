import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

type Msg = { id:number, user:string, text:string, created_at:string, channel:string, avatar:string }

export default function App(){
  const [msgs,setMsgs]=useState<Msg[]>([])
  const [input,setInput]=useState('')
  const [activeDM,setActiveDM]=useState('Xita Poko')
  const [dms,setDms]=useState([
    {name:'Xita Poko', members:'6 membros'},
    {name:'exz', members:''},
    {name:'Jvictor', members:''},
    {name:'Brasil Mundo Real', members:''},
  ])
  const [screenStream,setScreenStream]=useState<MediaStream|null>(null)
  const [showNew,setShowNew]=useState(false)
  const [newName,setNewName]=useState('')
  const videoRef=useRef<HTMLVideoElement>(null)
  const endRef=useRef<HTMLDivElement>(null)

  // BUSCA E REALTIME
  useEffect(()=>{
    supabase.from('messages').select('*').eq('channel',activeDM).order('created_at',{ascending:true}).then(({data})=>{ if(data) setMsgs(data as any) })
    const ch=supabase.channel('dm-'+activeDM).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`channel=eq.${activeDM}`},p=>setMsgs(m=>[...m,p.new as Msg])).subscribe()
    return ()=>{supabase.removeChannel(ch)}
  },[activeDM])

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs])
  useEffect(()=>{ if(videoRef.current && screenStream) videoRef.current.srcObject=screenStream },[screenStream])

  const send=async()=>{
    if(!input.trim()) return
    const txt=input; setInput('')
    const {error}=await supabase.from('messages').insert({user:'W3scley',text:txt,avatar:'W',channel:activeDM})
    if(error) alert(error.message)
  }

  const shareScreen=async()=>{
    try{
      const s=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
      setScreenStream(s)
      s.getVideoTracks()[0].onended=()=>setScreenStream(null)
    }catch{}
  }

  const createDM=()=>{
    if(!newName.trim()) return
    setDms([...dms,{name:newName,members:'1 membro'}])
    setActiveDM(newName)
    setNewName(''); setShowNew(false)
  }

  return (
    <div className="flex h-screen bg-[#313338] text-[#f2f3f5] text- overflow-hidden">
      <div className="w- bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
        <div className="w-12 h-12 bg-[#5865f2] rounded- flex items-center justify-center">💬</div>
        <div className="w-8 h- bg-[#2b2d31] my-1"></div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center">🟢</div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center">📦</div>
        <button onClick={()=>setShowNew(true)} className="w-12 h-12 bg-[#23a559] rounded-full flex items-center justify-center text-white text-xl">+</button>
      </div>

      <div className="w- bg-[#2b2d31] flex flex-col">
        <div className="p-2.5"><button className="w-full bg-[#1e1f22] text-[#949ba4] text- py-2 rounded">Encontre ou comece uma conversa</button></div>
        <div className="px-2 space-y-1">
          <div className="flex items-center gap-3 px-2 py-1.5 text-[#949ba4] hover:bg-[#35373c] rounded cursor-pointer">👥 Amigos <span className="ml-auto bg-red-500 text-white text- px-1.5 rounded-full">2</span></div>
          <div className="flex items-center gap-3 px-2 py-1.5 text-[#949ba4] hover:bg-[#35373c] rounded cursor-pointer">📩 Solicitações</div>
          <div className="flex items-center gap-3 px-2 py-1.5 text-[#949ba4] hover:bg-[#35373c] rounded cursor-pointer">🚀 Nitro</div>
          <div className="flex items-center gap-3 px-2 py-1.5 text-[#949ba4] hover:bg-[#35373c] rounded cursor-pointer">🏪 Loja <span className="ml-auto bg-white text-black text- px-1 rounded-full font-bold">NOVO</span></div>
        </div>
        <div className="mt-4 px-2 flex-1 overflow-y-auto">
          <div className="flex justify-between text- text-[#949ba4] font-bold uppercase px-2 mb-2">Mensagens diretas <button onClick={()=>setShowNew(true)}>+</button></div>
          {dms.map(d=>(
            <div key={d.name} onClick={()=>setActiveDM(d.name)} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${activeDM===d.name?'bg-[#404249] text-white':'text-[#949ba4] hover:bg-[#35373c]'}`}>
              <div className="w-8 h-8 bg-[#41434a] rounded-full flex items-center justify-center text-xs">{d.name[0]}</div>
              <div><div className="text-">{d.name}</div>{d.members && <div className="text-">{d.members}</div>}</div>
            </div>
          ))}
        </div>
        <div className="h- bg-[#232428] px-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#f23f42] rounded-full"></div><div><div className="text- font-bold">W3scley</div><div className="text- text-[#23a559]">Online</div></div></div>
          <div className="flex gap-1">⚙️</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#313338]">
        <div className="h- border-b border-[#1f2023] flex items-center px-4 justify-between">
          <div className="font-bold">🛡️ {activeDM}</div>
          <div className="flex items-center gap-4 text-[#b5bac1]">
            <button onClick={shareScreen} className="hover:text-white">📹 Compartilhar Tela</button>
            <span>📞</span><span>🔕</span>
            <div className="bg-[#1e1f22] rounded-full px-3 py-1 text-">Buscar</div>
          </div>
        </div>

        {screenStream && <div className="bg-black p-3 relative"><video ref={videoRef} autoPlay className="w-full max-h- rounded"/><button onClick={()=>{screenStream.getTracks().forEach(t=>t.stop());setScreenStream(null)}} className="absolute top-5 right-5 bg-red-600 px-4 py-2 rounded text-sm">Parar Tela</button></div>}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.length===0 && <div className="text-[#949ba4]">Esse é o início do histórico de {activeDM}.</div>}
          {msgs.map(m=>(
            <div key={m.id} className="flex gap-3 hover:bg-[#2e3035] px-2 py-1 rounded">
              <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center shrink-0">{m.avatar}</div>
              <div><div className="flex gap-2"><span className="font-medium text-white">{m.user}</span><span className="text- text-[#949ba4]">{new Date(m.created_at).toLocaleTimeString()}</span></div><div className="text-[#dbdee1] break-all">{m.text}</div></div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>

        <div className="p-4">
          <div className="bg-[#383a40] rounded-lg flex items-center px-3 py-2">
            <button className="w-6 h-6 bg-[#b5bac1] rounded-full flex items-center justify-center text-[#383a40] mr-3">+</button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`Conversar em ${activeDM}`} className="flex-1 bg-transparent outline-none"/>
            <button onClick={send} className="ml-3 bg-[#5865f2] w-8 h-8 rounded-full">➤</button>
          </div>
        </div>
      </div>

      <div className="w- bg-[#2b2d31] p-3 hidden lg:block">
        <h3 className="text- text-[#949ba4] font-bold mb-3">Membros — {dms.length}</h3>
        <div className="space-y-2 text-[#949ba4] text-sm">
          <div>• W3scley — Online</div>
          {dms.map(d=><div key={d.name}>• {d.name}</div>)}
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#313338] rounded w- p-4">
            <h2 className="text-xl font-bold mb-2">Criar grupo DM</h2>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nome do grupo ex: Xita Poko 2" className="w-full bg-[#1e1f22] p-2 rounded outline-none mb-3"/>
            <div className="flex justify-end gap-2"><button onClick={()=>setShowNew(false)} className="px-4 py-2 bg-[#2b2d31] rounded">Cancelar</button><button onClick={createDM} className="px-4 py-2 bg-[#5865f2] rounded">Criar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}