import { useState, useEffect, useRef } from 'react'

type User = { id:string, name:string, avatar:string, password:string }
type Group = { id:string, name:string, members:string[] }
type Message = { id:number, user:string, text:string, groupId:string, avatar:string, time:string }

export default function App(){
  const [users,setUsers]=useState<User[]>(()=>JSON.parse(localStorage.getItem('nexus-users')||'[]'))
  const [currentUser,setCurrentUser]=useState<User|null>(()=>JSON.parse(localStorage.getItem('nexus-current')||'null'))
  const [groups,setGroups]=useState<Group[]>(()=>JSON.parse(localStorage.getItem('nexus-groups')||'[]'))
  const [msgs,setMsgs]=useState<Message[]>(()=>JSON.parse(localStorage.getItem('nexus-msgs')||'[]'))
  const [activeGroup,setActiveGroup]=useState('')
  const [input,setInput]=useState('')
  const [showCreateGroup,setShowCreateGroup]=useState(false)
  const [showProfile,setShowProfile]=useState(false)
  const [newGroupName,setNewGroupName]=useState('')
  const [friendName,setFriendName]=useState('')
  const [signupName,setSignupName]=useState('')
  const [signupPass,setSignupPass]=useState('')
  const [loginName,setLoginName]=useState('')
  const [loginPass,setLoginPass]=useState('')
  const [isSignup,setIsSignup]=useState(false)
  const [inCall,setInCall]=useState(false)
  const [screenOn,setScreenOn]=useState(false)
  const videoRef=useRef<HTMLVideoElement>(null)
  const screenRef=useRef<HTMLVideoElement>(null)
  const endRef=useRef<HTMLDivElement>(null)
  const fileRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{localStorage.setItem('nexus-users',JSON.stringify(users))},[users])
  useEffect(()=>{localStorage.setItem('nexus-current',JSON.stringify(currentUser))},[currentUser])
  useEffect(()=>{localStorage.setItem('nexus-groups',JSON.stringify(groups))},[groups])
  useEffect(()=>{localStorage.setItem('nexus-msgs',JSON.stringify(msgs))},[msgs])
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[msgs,activeGroup])

  const handleSignup=()=>{
    if(!signupName||!signupPass) return alert('Digite nome e senha')
    if(users.find(u=>u.name===signupName)) return alert('Já existe')
    const newUser={id:Date.now().toString(),name:signupName,avatar:'',password:signupPass}
    setUsers([...users,newUser]); setCurrentUser(newUser)
  }
  const handleLogin=()=>{
    const u=users.find(u=>u.name===loginName&&u.password===loginPass)
    if(!u) return alert('Senha errada')
    setCurrentUser(u)
  }
  const createGroup=()=>{
    if(!newGroupName.trim()) return alert('Nome obrigatório')
    const members=[currentUser!.name,...friendName.split(',').map(s=>s.trim()).filter(Boolean)]
    const g={id:Date.now().toString(),name:newGroupName,members}
    setGroups([...groups,g]); setActiveGroup(g.id); setNewGroupName(''); setFriendName(''); setShowCreateGroup(false)
  }
  const changeAvatar=(e:any)=>{
    const f=e.target.files[0]; if(!f||!currentUser) return
    const r=new FileReader(); r.onload=ev=>{
      const avatar=ev.target?.result as string
      const updated={...currentUser,avatar}
      setCurrentUser(updated); setUsers(users.map(u=>u.id===currentUser.id?updated:u))
    }; r.readAsDataURL(f)
  }
  const shareScreen=async()=>{
    try{
      const s=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
      if(screenRef.current){ screenRef.current.srcObject=s; screenRef.current.play() }
      setScreenOn(true)
      s.getVideoTracks()[0].onended=()=>{ setScreenOn(false) }
      // @ts-ignore
      window._screen=s
    }catch(e){ alert('Clique em Compartilhar na janela do Chrome') }
  }
  const startCall=async()=>{
    try{
      const s=await navigator.mediaDevices.getUserMedia({audio:true,video:false})
      if(videoRef.current) videoRef.current.srcObject=s
      setInCall(true)
      // @ts-ignore
      window._call=s
    }catch{ alert('Permita microfone') }
  }
  const endCall=()=>{ // @ts-ignore
    window._call?.getTracks().forEach((t:any)=>t.stop()); setInCall(false)
  }
  const send=()=>{
    if(!input.trim()||!activeGroup) return
    const m={id:Date.now(),user:currentUser!.name,text:input,groupId:activeGroup,avatar:currentUser!.avatar,time:new Date().toLocaleTimeString()}
    setMsgs([...msgs,m]); setInput('')
  }

  if(!currentUser){
    return(
      <div className="h-screen bg-[#313338] flex items-center justify-center">
        <div className="bg-[#2b2d31] p-8 rounded-lg w-">
          <h1 className="text-white text-2xl font-bold mb-2 text-center">NEXUS ZERO</h1>
          <p className="text-[#949ba4] text-sm mb-6 text-center">Site zerado - 100% funcionando</p>
          {!isSignup?(
            <>
              <input value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="Nome de usuário" className="w-full bg-[#1e1f22] p-3 rounded mb-3 text-white outline-none"/>
              <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Senha" className="w-full bg-[#1e1f22] p-3 rounded mb-4 text-white outline-none"/>
              <button onClick={handleLogin} className="w-full bg-[#5865f2] py-3 rounded font-bold text-white">Entrar</button>
              <button onClick={()=>setIsSignup(true)} className="w-full mt-3 text-[#949ba4] text-sm">Criar conta</button>
            </>
          ):(
            <>
              <input value={signupName} onChange={e=>setSignupName(e.target.value)} placeholder="Criar nome de usuário" className="w-full bg-[#1e1f22] p-3 rounded mb-3 text-white outline-none"/>
              <input type="password" value={signupPass} onChange={e=>setSignupPass(e.target.value)} placeholder="Criar senha" className="w-full bg-[#1e1f22] p-3 rounded mb-4 text-white outline-none"/>
              <button onClick={handleSignup} className="w-full bg-[#23a559] py-3 rounded font-bold text-white">Criar Conta</button>
              <button onClick={()=>setIsSignup(false)} className="w-full mt-3 text-[#949ba4] text-sm">Já tem conta? Entrar</button>
            </>
          )}
        </div>
      </div>
    )
  }

  const currentGroup=groups.find(g=>g.id===activeGroup)
  const filteredMsgs=msgs.filter(m=>m.groupId===activeGroup)

  return(
    <div className="flex h-screen bg-[#313338] text-white text-">
      <div className="w- bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
        <div className="w-12 h-12 bg-[#5865f2] rounded- flex items-center justify-center">N</div>
        <div className="w-8 h- bg-[#2b2d31] my-1"></div>
        {groups.map(g=><div key={g.id} onClick={()=>setActiveGroup(g.id)} className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer text-xs ${activeGroup===g.id?'bg-[#5865f2] rounded-':'bg-[#313338]'}`}>{g.name[0]}</div>)}
        <button onClick={()=>setShowCreateGroup(true)} className="w-12 h-12 bg-[#23a559] rounded-full flex items-center justify-center text-xl">+</button>
      </div>
      <div className="w- bg-[#2b2d31] flex flex-col">
        <div className="p-3 font-bold border-b border-[#1f2023]">NEXUS ZERO</div>
        <div className="flex-1 p-2">
          <div className="flex justify-between text- text-[#949ba4] uppercase px-2 mb-2">Grupos <button onClick={()=>setShowCreateGroup(true)}>+</button></div>
          {groups.length===0&&<div className="text-[#6d6f78] text-xs px-2">Nenhum grupo - Crie um!</div>}
          {groups.map(g=><div key={g.id} onClick={()=>setActiveGroup(g.id)} className={`px-2 py-2 rounded cursor-pointer ${activeGroup===g.id?'bg-[#404249]':''}`}># {g.name}</div>)}
        </div>
        <div className="h- bg-[#232428] px-2 flex items-center justify-between">
          <div onClick={()=>setShowProfile(true)} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#5865f2] overflow-hidden flex items-center justify-center">{currentUser.avatar?<img src={currentUser.avatar} className="w-full h-full object-cover"/>:currentUser.name[0]}</div>
            <div><div className="text-">{currentUser.name}</div><div className="text- text-[#23a559]">Avatar</div></div>
          </div>
          <button onClick={()=>{setCurrentUser(null); setActiveGroup('')}} className="text-xs text-[#949ba4]">Sair</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-[#313338]">
        {!activeGroup?(
          <div className="flex-1 flex items-center justify-center flex-col text-[#949ba4]">
            <div className="text-6xl mb-4">💬</div>
            <div>Site zerado! Crie um grupo no +</div>
            <button onClick={()=>setShowCreateGroup(true)} className="mt-4 bg-[#5865f2] px-6 py-2 rounded">Criar Grupo</button>
          </div>
        ):(
          <>
            <div className="h- border-b border-[#1f2023] flex items-center px-4 justify-between">
              <div className="font-bold"># {currentGroup?.name}</div>
              <div className="flex gap-2">
                <button onClick={startCall} className="bg-[#2b2d31] px-3 py-1 rounded text-xs">📞 Voz</button>
                <button onClick={shareScreen} className="bg-[#2b2d31] px-3 py-1 rounded text-xs">🖥️ Tela</button>
                {inCall&&<button onClick={endCall} className="bg-red-600 px-3 py-1 rounded text-xs">Desligar</button>}
              </div>
            </div>
            {inCall&&<div className="bg-[#1e1f22] p-3 flex gap-3"><video ref={videoRef} autoPlay muted className="w-32 h-20 bg-black rounded"/><span className="text-green-400 text-xs">● Em chamada de voz</span></div>}
            {screenOn&&<div className="bg-black p-2 border-2 border-green-500"><div className="text-green-400 text-xs mb-2">● SUA TELA APARECENDO AQUI:</div><video ref={screenRef} autoPlay playsInline muted className="w-full h- bg-[#111] rounded object-contain"/><button onClick={()=>{/*@ts-ignore*/window._screen?.getTracks().forEach((t:any)=>t.stop());setScreenOn(false)}} className="mt-2 bg-red-600 px-3 py-1 rounded text-xs">Parar Tela</button></div>}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredMsgs.map(m=><div key={m.id} className="flex gap-3"><div className="w-8 h-8 rounded-full bg-[#5865f2] overflow-hidden flex items-center justify-center text-xs">{m.avatar?<img src={m.avatar} className="w-full h-full object-cover"/>:m.user[0]}</div><div><div className="flex gap-2"><span className="font-bold">{m.user}</span><span className="text- text-[#949ba4]">{m.time}</span></div><div>{m.text}</div></div></div>)}
              <div ref={endRef}/>
            </div>
            <div className="p-3"><div className="bg-[#383a40] rounded-lg flex items-center px-3 py-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`Conversar em #${currentGroup?.name}`} className="flex-1 bg-transparent outline-none"/><button onClick={send} className="ml-2 bg-[#5865f2] w-8 h-8 rounded-full">➤</button></div></div>
          </>
        )}
      </div>
      {showCreateGroup&&(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#313338] rounded w- p-5">
            <h2 className="font-bold text-lg mb-3">Criar Grupo</h2>
            <input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} placeholder="Nome do grupo" className="w-full bg-[#1e1f22] p-3 rounded mb-3 outline-none"/>
            <input value={friendName} onChange={e=>setFriendName(e.target.value)} placeholder="Amigos ex: Ana, João" className="w-full bg-[#1e1f22] p-3 rounded mb-4 outline-none"/>
            <div className="flex justify-end gap-2"><button onClick={()=>setShowCreateGroup(false)} className="px-4 py-2 bg-[#2b2d31] rounded">Cancelar</button><button onClick={createGroup} className="px-4 py-2 bg-[#5865f2] rounded">Criar</button></div>
          </div>
        </div>
      )}
      {showProfile&&(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#313338] rounded w- p-5">
            <h2 className="font-bold text-lg mb-3">Avatar</h2>
            <div className="flex gap-4 mb-4"><div className="w-20 h-20 rounded-full bg-[#5865f2] overflow-hidden flex items-center justify-center text-2xl">{currentUser.avatar?<img src={currentUser.avatar} className="w-full h-full object-cover"/>:currentUser.name[0]}</div><div className="flex-1"><button onClick={()=>fileRef.current?.click()} className="w-full bg-[#5865f2] py-2 rounded">📸 Foto</button><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={changeAvatar}/></div></div>
            <button onClick={()=>setShowProfile(false)} className="w-full bg-[#23a559] py-2 rounded">Salvar</button>
          </div>
        </div>
      )}
    </div>
  )
}