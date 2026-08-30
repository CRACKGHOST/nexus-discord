import { useState, useEffect, useRef } from 'react'
type User={id:string,name:string,avatar:string,password:string}
type Group={id:string,name:string,members:string[],invite:string}
type Message={id:number,user:string,text:string,groupId:string,avatar:string,time:string}

export default function App(){
  const [users,setUsers]=useState<User[]>(()=>JSON.parse(localStorage.getItem('nexus-users')||'[]'))
  const [currentUser,setCurrentUser]=useState<User|null>(()=>JSON.parse(localStorage.getItem('nexus-current')||'null'))
  const [groups,setGroups]=useState<Group[]>(()=>JSON.parse(localStorage.getItem('nexus-groups')||'[]'))
  const [msgs,setMsgs]=useState<Message[]>(()=>JSON.parse(localStorage.getItem('nexus-msgs')||'[]'))
  const [dms,setDms]=useState<string[]>(()=>JSON.parse(localStorage.getItem('nexus-dms')||'[]'))
  const [activeGroup,setActiveGroup]=useState(''); const [activeDM,setActiveDM]=useState('')
  const [input,setInput]=useState(''); const [showCreateGroup,setShowCreateGroup]=useState(false)
  const [showProfile,setShowProfile]=useState(false); const [showInvite,setShowInvite]=useState<Group|null>(null)
  const [showDevices,setShowDevices]=useState(false); const [newGroupName,setNewGroupName]=useState('')
  const [friendName,setFriendName]=useState(''); const [inviteCode,setInviteCode]=useState('')
  const [signupName,setSignupName]=useState(''); const [signupPass,setSignupPass]=useState('')
  const [loginName,setLoginName]=useState(''); const [loginPass,setLoginPass]=useState('')
  const [isSignup,setIsSignup]=useState(false); const [inCall,setInCall]=useState(false); const [screenOn,setScreenOn]=useState(false)
  const [mics,setMics]=useState<MediaDeviceInfo[]>([]); const [fones,setFones]=useState<MediaDeviceInfo[]>([])
  const [selectedMic,setSelectedMic]=useState(''); const [selectedFone,setSelectedFone]=useState('')
  const videoRef=useRef<HTMLVideoElement>(null); const screenRef=useRef<HTMLVideoElement>(null)
  const endRef=useRef<HTMLDivElement>(null); const fileRef=useRef<HTMLInputElement>(null)

  useEffect(()=>localStorage.setItem('nexus-users',JSON.stringify(users)),[users])
  useEffect(()=>localStorage.setItem('nexus-current',JSON.stringify(currentUser)),[currentUser])
  useEffect(()=>localStorage.setItem('nexus-groups',JSON.stringify(groups)),[groups])
  useEffect(()=>localStorage.setItem('nexus-msgs',JSON.stringify(msgs)),[msgs])
  useEffect(()=>localStorage.setItem('nexus-dms',JSON.stringify(dms)),[dms])
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[msgs,activeGroup,activeDM])
  useEffect(()=>{navigator.mediaDevices.enumerateDevices().then(devs=>{setMics(devs.filter(d=>d.kind==='audioinput')); setFones(devs.filter(d=>d.kind==='audiooutput'))})},[])

  const handleSignup=()=>{ if(!signupName||!signupPass) return alert('Digite nome e senha'); if(users.find(u=>u.name===signupName)) return alert('Já existe'); const nu={id:Date.now().toString(),name:signupName,avatar:'',password:signupPass}; setUsers([...users,nu]); setCurrentUser(nu) }
  const handleLogin=()=>{ const u=users.find(u=>u.name===loginName&&u.password===loginPass); if(!u) return alert('Senha errada'); setCurrentUser(u) }
  const createGroup=()=>{ if(!newGroupName.trim()) return alert('Nome obrigatório'); const invite=Math.random().toString(36).substring(2,8).toUpperCase(); const members=[currentUser!.name,...friendName.split(',').map(s=>s.trim()).filter(Boolean)]; const g={id:Date.now().toString(),name:newGroupName,members,invite}; setGroups([...groups,g]); setActiveGroup(g.id); setActiveDM(''); setShowCreateGroup(false); setNewGroupName(''); setFriendName('') }
  const joinByInvite=()=>{ const g=groups.find(g=>g.invite===inviteCode.toUpperCase()); if(!g) return alert('Código inválido'); if(!g.members.includes(currentUser!.name)){g.members.push(currentUser!.name); setGroups([...groups])} setActiveGroup(g.id); setActiveDM(''); setInviteCode('') }
  const startDM=(friend:string)=>{ if(friend===currentUser!.name) return; if(!dms.includes(friend)) setDms([...dms,friend]); setActiveDM(friend); setActiveGroup('') }
  const changeAvatar=(e:any)=>{ const f=e.target.files[0]; if(!f||!currentUser) return; const r=new FileReader(); r.onload=ev=>{ const avatar=ev.target?.result as string; const up={...currentUser,avatar}; setCurrentUser(up); setUsers(users.map(u=>u.id===currentUser.id?up:u)) }; r.readAsDataURL(f) }

  const shareScreen=async()=>{
    try{
      const s=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
      if(screenRef.current){ screenRef.current.srcObject=s; await screenRef.current.play() }
      setScreenOn(true)
      const track=s.getVideoTracks()[0]; if(track){ track.onended=()=>setScreenOn(false) }
      ;(window as any)._screen=s
    }catch{ alert('Escolha Tela Inteira e clique Compartilhar') }
  }
  const startCall=async()=>{
    try{
      const constraints:any={audio: selectedMic?{deviceId:{exact:selectedMic}}:true, video:false}
      const s=await navigator.mediaDevices.getUserMedia(constraints)
      if(videoRef.current){ videoRef.current.srcObject=s; if(selectedFone){ try{ await (videoRef.current as any).setSinkId(selectedFone) }catch{} } }
      setInCall(true); (window as any)._call=s
    }catch{ alert('Permita o microfone') }
  }

  const send=()=>{
    if(!input.trim()) return
    const gid=activeDM?`DM-${[currentUser!.name,activeDM].sort().join('-')}`:activeGroup
    if(!gid) return
    const m={id:Date.now(),user:currentUser!.name,text:input,groupId:gid,avatar:currentUser!.avatar,time:new Date().toLocaleTimeString()}
    setMsgs([...msgs,m]); setInput('')
  }

  if(!currentUser){
    return(<div className="h-screen bg-[#313338] flex items-center justify-center"><div className="bg-[#2b2d31] p-8 rounded-lg w-"><h1 className="text-white text-2xl font-bold mb-2 text-center">NEXUS ZERO</h1>{!isSignup?(<><input value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="Nome" className="w-full bg-[#1e1f22] p-3 rounded mb-3 text-white outline-none"/><input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Senha" className="w-full bg-[#1e1f22] p-3 rounded mb-4 text-white outline-none"/><button onClick={handleLogin} className="w-full bg-[#5865f2] py-3 rounded font-bold text-white">Entrar</button><button onClick={()=>setIsSignup(true)} className="w-full mt-3 text-[#949ba4] text-sm">Criar conta</button></>):(<><input value={signupName} onChange={e=>setSignupName(e.target.value)} placeholder="Criar nome" className="w-full bg-[#1e1f22] p-3 rounded mb-3 text-white outline-none"/><input type="password" value={signupPass} onChange={e=>setSignupPass(e.target.value)} placeholder="Criar senha" className="w-full bg-[#1e1f22] p-3 rounded mb-4 text-white outline-none"/><button onClick={handleSignup} className="w-full bg-[#23a559] py-3 rounded font-bold text-white">Criar Conta</button><button onClick={()=>setIsSignup(false)} className="w-full mt-3 text-[#949ba4] text-sm">Já tem conta?</button></>)}</div></div>)
  }

  const currentGroup=groups.find(g=>g.id===activeGroup)
  const filteredMsgs=msgs.filter(m=>m.groupId===(activeDM?`DM-${[currentUser!.name,activeDM].sort().join('-')}`:activeGroup))

  return(
    <div className="flex h-screen bg-[#313338] text-white text-">
      <div className="w- bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
        <div className="w-12 h-12 bg-[#5865f2] rounded- flex items-center justify-center">N</div>
        <div className="w-8 h- bg-[#2b2d31] my-1"></div>
        {groups.map(g=><div key={g.id} onClick={()=>{setActiveGroup(g.id); setActiveDM('')}} className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer text-xs ${activeGroup===g.id?'bg-[#5865f2] rounded-':'bg-[#313338]'}`}>{g.name[0]}</div>)}
        <button onClick={()=>setShowCreateGroup(true)} className="w-12 h-12 bg-[#23a559] rounded-full flex items-center justify-center text-xl">+</button>
      </div>
      <div className="w- bg-[#2b2d31] flex flex-col">
        <div className="p-3 font-bold border-b border-[#1f2023]">NEXUS ZERO</div>
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="mb-4"><div className="text- text-[#949ba4] uppercase px-2 mb-2">Mensagens Diretas</div>{dms.map(name=><div key={name} onClick={()=>startDM(name)} className={`px-2 py-2 rounded cursor-pointer ${activeDM===name?'bg-[#404249]':''}`}>@ {name}</div>)}<input value={friendName} onChange={e=>setFriendName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&friendName.trim()){startDM(friendName.trim()); setFriendName('')}}} placeholder="+ Novo chat privado" className="w-full mt-2 bg-[#1e1f22] p-2 rounded text-xs outline-none"/></div>
          <div className="text- text-[#949ba4] uppercase px-2 mb-2">Grupos</div>
          {groups.map(g=><div key={g.id} className={`px-2 py-1 rounded flex justify-between items-center ${activeGroup===g.id?'bg-[#404249]':''}`}><div onClick={()=>{setActiveGroup(g.id); setActiveDM('')}} className="cursor-pointer flex-1"># {g.name}</div><button onClick={()=>setShowInvite(g)} className="text-">👥</button></div>)}
          <div className="mt-4 p-2 bg-[#1e1f22] rounded"><div className="text- text-[#949ba4] mb-1">ENTRAR COM CONVITE</div><div className="flex gap-1"><input value={inviteCode} onChange={e=>setInviteCode(e.target.value)} placeholder="Código" className="flex-1 bg-[#2b2d31] p-1 rounded text-xs outline-none"/><button onClick={joinByInvite} className="bg-[#5865f2] px-2 rounded text-xs">Entrar</button></div></div>
        </div>
        <div className="h- bg-[#232428] px-2 flex items-center justify-between"><div onClick={()=>setShowProfile(true)} className="flex items-center gap-2 cursor-pointer"><div className="w-8 h-8 rounded-full bg-[#5865f2] overflow-hidden flex items-center justify-center">{currentUser.avatar?<img src={currentUser.avatar} className="w-full h-full object-cover"/>:currentUser.name[0]}</div><div className="text-">{currentUser.name}</div></div><div className="flex gap-1"><button onClick={()=>setShowDevices(true)} className="text-xs">🎧</button><button onClick={()=>{setCurrentUser(null); setActiveGroup(''); setActiveDM('')}} className="text-xs text-[#949ba4]">Sair</button></div></div>
      </div>
      <div className="flex-1 flex flex-col bg-[#313338]">
        {!activeGroup&&!activeDM?(<div className="flex-1 flex items-center justify-center flex-col text-[#949ba4]"><div className="text-6xl mb-4">💬</div><div>Selecione um grupo ou DM</div></div>):(
          <>
            <div className="h- border-b border-[#1f2023] flex items-center px-4 justify-between"><div className="font-bold">{activeDM?`@ ${activeDM}`:`# ${currentGroup?.name} - ${currentGroup?.invite}`}</div><div className="flex gap-2"><button onClick={startCall} className="bg-[#2b2d31] px-3 py-1 rounded text-xs">📞 Voz</button><button onClick={shareScreen} className="bg-[#2b2d31] px-3 py-1 rounded text-xs">🖥️ Tela</button>{currentGroup&&<button onClick={()=>setShowInvite(currentGroup!)} className="bg-[#23a559] px-3 py-1 rounded text-xs">👥 Convidar</button>}{inCall&&<button onClick={()=>{ (window as any)._call?.getTracks().forEach((t:any)=>t.stop()); setInCall(false)}} className="bg-red-600 px-3 py-1 rounded text-xs">Desligar</button>}</div></div>
            {inCall&&<div className="bg-[#1e1f22] p-3 flex gap-3"><video ref={videoRef} autoPlay muted className="w-32 h-20 bg-black rounded"/><span className="text-green-400 text-xs">● Em chamada</span></div>}
            {screenOn&&<div className="bg-black p-2 border-2 border-green-500"><div className="text-green-400 text-xs mb-2">● SUA TELA:</div><video ref={screenRef} autoPlay playsInline muted className="w-full h- bg-[#111] rounded object-contain"/><button onClick={()=>{ (window as any)._screen?.getTracks().forEach((t:any)=>t.stop()); setScreenOn(false)}} className="mt-2 bg-red-600 px-3 py-1 rounded text-xs">Parar Tela</button></div>}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">{filteredMsgs.map(m=><div key={m.id} className="flex gap-3"><div className="w-8 h-8 rounded-full bg-[#5865f2] overflow-hidden flex items-center justify-center text-xs">{m.avatar?<img src={m.avatar} className="w-full h-full object-cover"/>:m.user[0]}</div><div><div className="flex gap-2"><span className="font-bold">{m.user}</span><span className="text- text-[#949ba4]">{m.time}</span></div><div>{m.text}</div></div></div>)}<div ref={endRef}/></div>
            <div className="p-3"><div className="bg-[#383a40] rounded-lg flex items-center px-3 py-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={activeDM?`Falar com ${activeDM}`:`Falar em #${currentGroup?.name}`} className="flex-1 bg-transparent outline-none"/><button onClick={send} className="ml-2 bg-[#5865f2] w-8 h-8 rounded-full">➤</button></div></div>
          </>
        )}
      </div>
      {showCreateGroup&&(<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="bg-[#313338] rounded w- p-5"><h2 className="font-bold text-lg mb-3">Criar Grupo</h2><input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} placeholder="Nome do grupo" className="w-full bg-[#1e1f22] p-3 rounded mb-3 outline-none"/><button onClick={createGroup} className="w-full bg-[#5865f2] py-2 rounded">Criar</button><button onClick={()=>setShowCreateGroup(false)} className="w-full mt-2 bg-[#2b2d31] py-2 rounded">Cancelar</button></div></div>)}
      {showInvite&&(<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="bg-[#313338] rounded w- p-5"><h2 className="font-bold text-lg mb-3">Convidar - {showInvite.name}</h2><div className="bg-[#1e1f22] p-3 rounded mb-3 text-center"><div className="text-xs text-[#949ba4]">CÓDIGO:</div><div className="text-2xl font-bold tracking-widest py-2">{showInvite.invite}</div><button onClick={()=>{navigator.clipboard.writeText(showInvite.invite); alert('Copiado!')}} className="w-full bg-[#5865f2] py-2 rounded text-sm">Copiar Código</button></div><button onClick={()=>setShowInvite(null)} className="w-full bg-[#2b2d31] py-2 rounded">Fechar</button></div></div>)}
      {showDevices&&(<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="bg-[#313338] rounded w- p-5"><h2 className="font-bold text-lg mb-3">🎧 Mic e Fone</h2><div className="mb-3"><div className="text-xs text-[#949ba4]">Microfone:</div><select value={selectedMic} onChange={e=>setSelectedMic(e.target.value)} className="w-full bg-[#1e1f22] p-2 rounded text-sm">{mics.map(m=><option key={m.deviceId} value={m.deviceId}>{m.label||`Mic ${m.deviceId.slice(0,5)}`}</option>)}</select></div><div className="mb-3"><div className="text-xs text-[#949ba4]">Fone:</div><select value={selectedFone} onChange={e=>setSelectedFone(e.target.value)} className="w-full bg-[#1e1f22] p-2 rounded text-sm">{fones.map(f=><option key={f.deviceId} value={f.deviceId}>{f.label||`Fone ${f.deviceId.slice(0,5)}`}</option>)}</select></div><button onClick={()=>setShowDevices(false)} className="w-full bg-[#23a559] py-2 rounded">Salvar</button></div></div>)}
      {showProfile&&(<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="bg-[#313338] rounded w- p-5"><h2 className="font-bold text-lg mb-3">Avatar</h2><button onClick={()=>fileRef.current?.click()} className="w-full bg-[#5865f2] py-2 rounded">📸 Foto</button><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={changeAvatar}/><button onClick={()=>setShowProfile(false)} className="w-full mt-3 bg-[#23a559] py-2 rounded">Salvar</button></div></div>)}
    </div>
  )
}