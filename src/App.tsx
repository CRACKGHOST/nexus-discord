import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

type Msg = { id:number, user:string, text:string, created_at:string, channel:string, avatar:string }

export default function App(){
  const [msgs,setMsgs]=useState<Msg[]>([])
  const [input,setInput]=useState('')
  const [activeDM,setActiveDM]=useState('Xita Poko')
  const [dms,setDms]=useState([{name:'Xita Poko', members:'6 membros'}, {name:'exz'}, {name:'Jvictor'}, {name:'Brasil Mundo Real'}])
  const [myName,setMyName]=useState('W3scley')
  const [myAvatar,setMyAvatar]=useState('W')
  const [avatarFile,setAvatarFile]=useState<string>('')
  const [showNew,setShowNew]=useState(false)
  const [showProfile,setShowProfile]=useState(false)
  const [newName,setNewName]=useState('')
  const [localStream,setLocalStream]=useState<MediaStream|null>(null)
  const [screenStream,setScreenStream]=useState<MediaStream|null>(null)
  const [isInCall,setIsInCall]=useState(false)
  const videoRef=useRef<HTMLVideoElement>(null)
  const screenRef=useRef<HTMLVideoElement>(null)
  const endRef=useRef<HTMLDivElement>(null)
  const fileInputRef=useRef<HTMLInputElement>(null)

  // CHAT REAL
  useEffect(()=>{
    supabase.from('messages').select('*').eq('channel',activeDM).order('created_at',{ascending:true}).then(({data})=>{ if(data) setMsgs(data as any) })
    const ch=supabase.channel('chat-'+activeDM).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`channel=eq.${activeDM}`},p=>setMsgs(m=>[...m,p.new as Msg])).subscribe()
    return ()=>{supabase.removeChannel(ch)}
  },[activeDM])

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs])
  useEffect(()=>{ if(videoRef.current && localStream) videoRef.current.srcObject=localStream },[localStream])
  useEffect(()=>{ if(screenRef.current && screenStream) screenRef.current.srcObject=screenStream },[screenStream])

  const send=async()=>{
    if(!input.trim()) return
    const txt=input; setInput('')
    await supabase.from('messages').insert({user:myName, text:txt, avatar: avatarFile || myAvatar, channel:activeDM})
  }

  const handleAvatar = (e:any)=>{
    const file=e.target.files[0]
    if(!file) return
    const reader=new FileReader()
    reader.onload=(ev)=>{ setAvatarFile(ev.target?.result as string); setMyAvatar(ev.target?.result as string) }
    reader.readAsDataURL(file)
  }

  const createGroup=()=>{
    if(!newName.trim()) return
    setDms([...dms,{name:newName, members:'1 membro'}])
    setActiveDM(newName)
    setNewName(''); setShowNew(false)
  }

  const startCall=async(video=false)=>{
    try{
      const s=await navigator.mediaDevices.getUserMedia({video, audio:true})
      setLocalStream(s); setIsInCall(true)
    }catch{ alert('Permita microfone/câmera') }
  }
  const endCall=()=>{
    localStream?.getTracks().forEach(t=>t.stop()); setLocalStream(null); setIsInCall(false)
  }
  const shareScreen=async()=>{
    try{
      const s=await navigator.mediaDevices.getDisplayMedia({video:true, audio:true})
      setScreenStream(s)
      s.getVideoTracks()[0].onended=()=>setScreenStream(null)
    }catch{}
  }

  return (
    <div className="flex h-screen bg-[#313338] text-[#f2f3f5] text- overflow-hidden">
      <div className="w- bg-[#1e1f22] flex flex-col items-center py-3 gap-2 shrink-0">
        <div className="w-12 h-12 bg-[#5865f2] rounded- flex items-center justify-center">💬</div>
        <div className="w-8 h- bg-[#2b2d31] my-1"></div>
        {dms.slice(0,3).map(d=><div key={d.name} className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center text-xs">{d.name[0]}</div>)}
        <button onClick={()=>setShowNew(true)} className="w-12 h-12 bg-[#23a559] rounded-full flex items-center justify-center text-white text-xl hover:rounded-">+</button>
      </div>

      <div className="w- bg-[#2b2d31] flex flex-col shrink-0">
        <div className="p-2.5"><button className="w-full bg-[#1e1f22] text-[#949ba4] text- py-2 rounded">Encontre ou comece uma conversa</button></div>
        <div className="px-2 flex-1 overflow-y-auto">
          <div className="flex justify-between text- text-[#949ba4] font-bold uppercase px-2 mb-2 mt-3">Mensagens diretas <button onClick={()=>setShowNew(true)}>+</button></div>
          {dms.map(d=>(
            <div key={d.name} onClick={()=>setActiveDM(d.name)} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${activeDM===d.name?'bg-[#404249] text-white':'text-[#949ba4] hover:bg-[#35373c]'}`}>
              <div className="w-8 h-8 bg-[#41434a] rounded-full flex items-center justify-center overflow-hidden">{d.name===activeDM && avatarFile? <img src={avatarFile} className="w-full h-full object-cover"/> : d.name[0]}</div>
              <div className="text-">{d.name}</div>
            </div>
          ))}
        </div>
        <div className="h- bg-[#232428] px-2 flex items-center justify-between">
          <div onClick={()=>setShowProfile(true)} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-[#5865f2] rounded-full overflow-hidden flex items-center justify-center">{avatarFile? <img src={avatarFile} className="w-full h-full object-cover"/> : myName[0]}</div>
            <div><div className="text- font-bold">{myName}</div><div className="text- text-[#23a559]">Online</div></div>
          </div>
          <button onClick={()=>setShowProfile(true)} className="text-[#b5bac1]">⚙️</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#313338]">
        <div className="h- border-b border-[#1f2023] flex items-center px-4 justify-between">
          <div className="font-bold">🛡️ {activeDM}</div>
          <div className="flex items-center gap-3">
            <button onClick={()=>startCall(false)} className="hover:text-white">📞 Ligação</button>
            <button onClick={()=>startCall(true)} className="hover:text-white">📹 Vídeo</button>
            <button onClick={shareScreen} className="hover:text-white">🖥️ Compartilhar Tela</button>
            {isInCall && <button onClick={endCall} className="bg-red-600 px-3 py-1 rounded">Desligar</button>}
          </div>
        </div>

        {isInCall && <div className="bg-[#1e1f22] p-3 flex gap-3"><video ref={videoRef} autoPlay muted className="w-48 h-32 bg-black rounded"/><div className="text-[#23a559] text-sm">● Em ligação com {activeDM} - Microfone ligado</div></div>}
        {screenStream && <div className="bg-black p-3 relative"><video ref={screenRef} autoPlay className="w-full max-h- rounded"/><button onClick={()=>{screenStream.getTracks().forEach(t=>t.stop());setScreenStream(null)}} className="absolute top-5 right-5 bg-red-600 px-4 py-2 rounded">Parar Tela</button></div>}

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {msgs.map(m=>(
            <div key={m.id} className="flex gap-3 hover:bg-[#2e3035] px-2 py-1 rounded">
              <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center shrink-0 overflow-hidden">{m.avatar?.startsWith('data:')? <img src={m.avatar} className="w-full h-full object-cover"/> : m.avatar || m.user[0]}</div>
              <div><div className="flex gap-2"><span className="font-medium text-white">{m.user}</span><span className="text- text-[#949ba4]">{new Date(m.created_at).toLocaleTimeString()}</span></div><div className="text-[#dbdee1] break-all">{m.text}</div></div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>

        <div className="p-4">
          <div className="bg-[#383a40] rounded-lg flex items-center px-3 py-2">
            <button onClick={()=>fileInputRef.current?.click()} className="w-6 h-6 bg-[#b5bac1] rounded-full flex items-center justify-center text-[#383a40] mr-3">+</button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar}/>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`Conversar em ${activeDM}`} className="flex-1 bg-transparent outline-none"/>
            <button onClick={send} className="ml-3 bg-[#5865f2] w-8 h-8 rounded-full">➤</button>
          </div>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#313338] rounded w- p-5">
            <h2 className="text-xl font-bold mb-3">Criar grupo</h2>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nome do grupo" className="w-full bg-[#1e1f22] p-3 rounded outline-none mb-4"/>
            <div className="flex justify-end gap-2"><button onClick={()=>setShowNew(false)} className="px-4 py-2 bg-[#2b2d31] rounded">Cancelar</button><button onClick={createGroup} className="px-4 py-2 bg-[#5865f2] rounded">Criar Grupo</button></div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#313338] rounded w- p-5">
            <h2 className="text-xl font-bold mb-3">Meu Perfil - Foto do Avatar</h2>
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 bg-[#5865f2] rounded-full overflow-hidden flex items-center justify-center text-2xl">{avatarFile? <img src={avatarFile} className="w-full h-full object-cover"/> : myName[0]}</div>
              <div className="flex-1">
                <label className="text-xs text-[#949ba4] uppercase font-bold">Nome</label>
                <input value={myName} onChange={e=>setMyName(e.target.value)} className="w-full bg-[#1e1f22] p-2 rounded mt-1"/>
                <button onClick={()=>fileInputRef.current?.click()} className="mt-3 bg-[#5865f2] px-4 py-2 rounded text-sm">📸 Colocar Foto do Avatar</button>
              </div>
            </div>
            <div className="flex justify-end"><button onClick={()=>setShowProfile(false)} className="px-6 py-2 bg-[#23a559] rounded">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}