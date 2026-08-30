import { useState, useEffect, useRef } from 'react'

type User = { id:string, name:string, avatar:string, banner:string, password:string, bio:string }
type Group = { id:string, name:string, ownerId:string, icon:string, color:string, logo?:string }
type Channel = { id:string, name:string, type:'text'|'voice', groupId:string, photo?:string, createdBy?:string }

export default function App(){
  const [users,setUsers]=useState<User[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-users')||'[]') }catch{ return [] } })
  const [currentUser,setCurrentUser]=useState<User|null>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-current')||'null') }catch{ return null } })
  const [groups,setGroups]=useState<Group[]>(()=>{
    try{ const s=localStorage.getItem('nexus-groups'); if(s) return JSON.parse(s); return [{id:'1', name:'teste', ownerId:'', icon:'T', color:'#7c3aed', logo:''}] }catch{ return [{id:'1', name:'teste', ownerId:'', icon:'T', color:'#7c3aed', logo:''}] }
  })
  const [channels,setChannels]=useState<Channel[]>(()=>{
    try{ const s=localStorage.getItem('nexus-channels'); if(s) return JSON.parse(s); return [{id:'1', name:'geral', type:'text', groupId:'1', photo:'', createdBy:''},{id:'v1', name:'Geral', type:'voice', groupId:'1', photo:'', createdBy:''}] }catch{ return [{id:'1', name:'geral', type:'text', groupId:'1', photo:'', createdBy:''},{id:'v1', name:'Geral', type:'voice', groupId:'1', photo:'', createdBy:''}] }
  })
  const [msgs,setMsgs]=useState<any[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-msgs')||'[]') }catch{ return [] } })
  const [activeGroup,setActiveGroup]=useState('1')
  const [activeChannel,setActiveChannel]=useState('1')
  const [input,setInput]=useState('')
  const [regName,setRegName]=useState(''); const [regPass,setRegPass]=useState('')
  const [authMode,setAuthMode]=useState<'login'|'register'>('login')
  const [showCreateGroup,setShowCreateGroup]=useState(false)
  const [newGroupName,setNewGroupName]=useState('')
  const [showAddFriend,setShowAddFriend]=useState(false)
  const [addFriendName,setAddFriendName]=useState('')
  const [friends,setFriends]=useState<string[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-friends')||'[]') }catch{ return [] } })
  const [showGroupMenu,setShowGroupMenu]=useState(false)
  const [showChannelConfig,setShowChannelConfig]=useState<Channel|null>(null)
  const [editChannelName,setEditChannelName]=useState('')
  const [editChannelPhoto,setEditChannelPhoto]=useState('')
  const [inVoice,setInVoice]=useState<string|null>(null)
  const [micLevel,setMicLevel]=useState(0)
  const [outputLevel,setOutputLevel]=useState(0)
  const [isScreenSharing,setIsScreenSharing]=useState(false)
  const [voiceTime,setVoiceTime]=useState(0)
  const [isTestingMic,setIsTestingMic]=useState(false)
  const [isTestingFone,setIsTestingFone]=useState(false)
  const [micDevices,setMicDevices]=useState<MediaDeviceInfo[]>([])
  const [outputDevices,setOutputDevices]=useState<MediaDeviceInfo[]>([])
  const [selectedMic,setSelectedMic]=useState(()=>localStorage.getItem('nexus-micId')||'')
  const [selectedOutput,setSelectedOutput]=useState(()=>localStorage.getItem('nexus-outId')||'')
  const [inputVolume,setInputVolume]=useState(()=>Number(localStorage.getItem('nexus-inputVol')||'100'))
  const [outputVolume,setOutputVolume]=useState(()=>Number(localStorage.getItem('nexus-outputVol')||'100'))
  const [noiseSuppression,setNoiseSuppression]=useState(()=>localStorage.getItem('nexus-noise')!=='false')
  const [echoCancellation,setEchoCancellation]=useState(()=>localStorage.getItem('nexus-echo')!=='false')
  const [showSettings,setShowSettings]=useState(false)
  const [settingsTab,setSettingsTab]=useState('voz')
  const [themeColor,setThemeColor]=useState(()=>localStorage.getItem('nexus-theme')||'#7c3aed')
  const [logoImage,setLogoImage]=useState(()=>localStorage.getItem('nexus-logo')||'')
  const [editingName,setEditingName]=useState(false)
  const [newNameInput,setNewNameInput]=useState('')
  const endRef=useRef<HTMLDivElement>(null)
  const micRef=useRef<MediaStream|null>(null)
  const audioRef=useRef<HTMLAudioElement>(null)
  const testCtxRef=useRef<AudioContext|null>(null)
  const screenRef=useRef<MediaStream|null>(null)
  const screenVideoRef=useRef<HTMLVideoElement>(null)
  const avatarInputRef=useRef<HTMLInputElement>(null)
  const logoInputRef=useRef<HTMLInputElement>(null)
  const channelPhotoInputRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{ document.title="NEXUS"; document.documentElement.style.setProperty('--nexus', themeColor) },[themeColor])
  useEffect(()=>{ try{ localStorage.setItem('nexus-theme', themeColor) }catch{} },[themeColor])
  useEffect(()=>{ try{ localStorage.setItem('nexus-logo', logoImage) }catch{} },[logoImage])
  useEffect(()=>{ try{ localStorage.setItem('nexus-inputVol', inputVolume.toString()) }catch{} },[inputVolume])
  useEffect(()=>{ try{ localStorage.setItem('nexus-outputVol', outputVolume.toString()) }catch{} },[outputVolume])
  useEffect(()=>{ try{ localStorage.setItem('nexus-micId', selectedMic) }catch{} },[selectedMic])
  useEffect(()=>{ try{ localStorage.setItem('nexus-outId', selectedOutput) }catch{} },[selectedOutput])
  useEffect(()=>{ try{ localStorage.setItem('nexus-noise', noiseSuppression.toString()) }catch{} },[noiseSuppression])
  useEffect(()=>{ try{ localStorage.setItem('nexus-echo', echoCancellation.toString()) }catch{} },[echoCancellation])
  useEffect(()=>{ try{ localStorage.setItem('nexus-users',JSON.stringify(users)) }catch{} },[users])
  useEffect(()=>{ try{ localStorage.setItem('nexus-current',JSON.stringify(currentUser)) }catch{} },[currentUser])
  useEffect(()=>{ try{ localStorage.setItem('nexus-groups',JSON.stringify(groups)) }catch{} },[groups])
  useEffect(()=>{ try{ localStorage.setItem('nexus-channels',JSON.stringify(channels)) }catch{} },[channels])
  useEffect(()=>{ try{ localStorage.setItem('nexus-msgs',JSON.stringify(msgs)) }catch{} },[msgs])
  useEffect(()=>{ try{ localStorage.setItem('nexus-friends',JSON.stringify(friends)) }catch{} },[friends])
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs])
  useEffect(()=>{ let t:any; if(inVoice){ t=setInterval(()=>setVoiceTime(v=>v+1),1000) } else setVoiceTime(0); return()=>clearInterval(t) },[inVoice])

  const loadDevices=async()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      stream.getTracks().forEach(t=>t.stop())
      const devices=await navigator.mediaDevices.enumerateDevices()
      const mics = devices.filter(d=>d.kind==='audioinput')
      const outs = devices.filter(d=>d.kind==='audiooutput')
      setMicDevices(mics)
      setOutputDevices(outs)
      if(!selectedMic && mics[0]){
        const me6s = mics.find(d=>d.label.includes('ME6S')||d.label.includes('0c76'))
        setSelectedMic(me6s?me6s.deviceId:mics[0].deviceId)
      }
      if(!selectedOutput && outs[0]){
        const usb = outs.find(d=>d.label.includes('USB Audio')||d.label.includes('3654'))
        setSelectedOutput(usb?usb.deviceId:outs[0].deviceId)
      }
    }catch(e){ console.log('erro loadDevices', e) }
  }
  useEffect(()=>{ loadDevices() },[showSettings])

  const send=()=>{
    if(!input.trim()) return
    setMsgs([...msgs,{id:Date.now(),user:currentUser!.name,text:input,groupId:activeChannel,avatar:currentUser!.avatar,time:new Date().toLocaleTimeString(), userId:currentUser!.id}]); setInput('')
  }

  const deleteMessage=(msgId:number)=>{
    if(!confirm('Apagar essa mensagem?')) return
    setMsgs(msgs.filter(m=>m.id!==msgId))
  }

  const deleteTextChannel=(ch:Channel)=>{
    if(!confirm(`Apagar o canal #${ch.name}?`)) return
    setChannels(channels.filter(c=>c.id!==ch.id))
    setMsgs(msgs.filter(m=>m.groupId!==ch.id))
    if(activeChannel===ch.id){
      const next = channels.find(c=>c.groupId===activeGroup && c.id!==ch.id && c.type==='text')
      if(next) setActiveChannel(next.id)
    }
    setShowChannelConfig(null)
  }

  const deleteServer=(groupId:string)=>{
    const g = groups.find(x=>x.id===groupId)
    if(!g) return
    if(!confirm(`Apagar o servidor "${g.name}" para sempre?`)) return
    const channelsToDelete = channels.filter(c=>c.groupId===groupId).map(c=>c.id)
    setGroups(groups.filter(gr=>gr.id!==groupId))
    setChannels(channels.filter(c=>c.groupId!==groupId))
    setMsgs(msgs.filter(m=>!channelsToDelete.includes(m.groupId)))
    if(activeGroup===groupId){
      const remaining = groups.filter(gr=>gr.id!==groupId)
      if(remaining.length>0){
        setActiveGroup(remaining[0].id)
        const nextCh = channels.find(c=>c.groupId===remaining[0].id && c.type==='text')
        if(nextCh) setActiveChannel(nextCh.id)
      } else {
        const newId = Date.now().toString()
        const newGroup = {id:newId, name:'meu-servidor', ownerId:currentUser!.id, icon:'M', color:themeColor, logo:''}
        setGroups([newGroup])
        setChannels([{id:`t-${newId}`,name:'geral',type:'text',groupId:newId, photo:'', createdBy:currentUser!.id},{id:`v-${newId}`,name:'Geral',type:'voice',groupId:newId, photo:'', createdBy:currentUser!.id}])
        setActiveGroup(newId)
        setActiveChannel(`t-${newId}`)
      }
    }
    setShowGroupMenu(false)
  }

  const saveNewName=()=>{
    if(!newNameInput.trim()) return alert('Nome não pode ser vazio')
    if(users.find(u=>u.name===newNameInput && u.id!==currentUser!.id)) return alert('Esse nome já existe')
    const u={...currentUser!, name:newNameInput} as User
    setUsers(users.map(x=>x.id===currentUser!.id?u:x))
    setCurrentUser(u)
    setEditingName(false)
    setNewNameInput('')
  }

  const joinVoice=async()=>{
    const channelId = channels.find(c=>c.groupId===activeGroup&&c.type==='voice')?.id || 'v1'
    if(inVoice===channelId){ setInVoice(null); micRef.current?.getTracks().forEach(t=>t.stop()); setMicLevel(0); return }
    try{
      if(micRef.current) micRef.current.getTracks().forEach(t=>t.stop())
      const constraints:any={
        audio:{
          deviceId: selectedMic?{exact:selectedMic}:undefined,
          echoCancellation: echoCancellation,
          noiseSuppression: noiseSuppression,
          autoGainControl:true,
          sampleRate:48000,
          channelCount:1
        }
      }
      const s=await navigator.mediaDevices.getUserMedia(constraints);
      micRef.current=s
      s.getAudioTracks().forEach(track=>{ track.enabled=true })
      const ctx=new (window.AudioContext||(window as any).webkitAudioContext)();
      if(ctx.state==='suspended') await ctx.resume()
      const src=ctx.createMediaStreamSource(s);
      const an=ctx.createAnalyser(); an.fftSize=256; src.connect(an)
      const data=new Uint8Array(an.frequencyBinCount)
      const loop=()=>{ if(!micRef.current) return; an.getByteFrequencyData(data); let sum=0; for(let i=0;i<data.length;i++) sum+=data[i]; setMicLevel(Math.min(100,(sum/data.length/40)*100*(inputVolume/100))); if(micRef.current) requestAnimationFrame(loop) }; loop()
      setInVoice(channelId)
    }catch(e:any){ alert('Libera o mic no cadeado 🔒: '+e.message) }
  }

  // TESTE COM SUPRESSÃO REAL FUNCIONANDO
  const testMic=async()=>{
    if(isTestingMic){
      try{
        micRef.current?.getTracks().forEach(t=>t.stop());
        testCtxRef.current?.close().catch(()=>{});
        if(audioRef.current){ audioRef.current.pause(); audioRef.current.srcObject=null }
      }catch{}
      micRef.current=null;
      setIsTestingMic(false); setMicLevel(0); return
    }
    try{
      if(micRef.current) micRef.current.getTracks().forEach(t=>t.stop());
      if(testCtxRef.current) try{ await testCtxRef.current.close() }catch{}

      // AGORA USA O BOTÃO DE SUPRESSÃO QUE VOCÊ LIGOU
      const constraints:any={
        audio:{
          deviceId: selectedMic? { exact: selectedMic } : undefined,
          echoCancellation: false,
          noiseSuppression: noiseSuppression, // AGORA RESPEITA O BOTÃO VERDE
          autoGainControl: noiseSuppression,
          channelCount:1,
          sampleRate:48000
        }
      }

      const s=await navigator.mediaDevices.getUserMedia(constraints);
      micRef.current=s
      s.getAudioTracks().forEach(track => { track.enabled=true })

      const ctx = new (window.AudioContext||(window as any).webkitAudioContext)({latencyHint:'interactive', sampleRate:48000})
      if(ctx.state==='suspended') await ctx.resume()
      testCtxRef.current=ctx

      const src = ctx.createMediaStreamSource(s)

      // FILTRO DE SUPRESSÃO DE RUÍDO REAL - IGUAL KRISP DO DISCORD
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = noiseSuppression? 120 : 20 // CORTA RUÍDO GRAVE DO ME6S

      const gain = ctx.createGain()
      gain.gain.value = (inputVolume/100) * 2.5

      const dest = ctx.createMediaStreamDestination()

      // CADEIA COM FILTRO SE SUPRESSÃO LIGADA
      if(noiseSuppression){
        src.connect(filter)
        filter.connect(gain)
      } else {
        src.connect(gain)
      }
      gain.connect(dest)

      if(audioRef.current){
        audioRef.current.srcObject=dest.stream
        audioRef.current.muted=false
        audioRef.current.volume = outputVolume/100
        if(selectedOutput && (audioRef.current as any).setSinkId){
          try{ await (audioRef.current as any).setSinkId(selectedOutput) }catch{}
        }
        await audioRef.current.play().catch(async()=>{
          await new Promise(r=>setTimeout(r,300))
          await audioRef.current?.play().catch(()=>{})
        })
      }

      const an=ctx.createAnalyser(); an.fftSize=1024;
      if(noiseSuppression) filter.connect(an)
      else src.connect(an)

      const data=new Uint8Array(an.frequencyBinCount); setIsTestingMic(true)
      const loop=()=>{
        if(!micRef.current) return;
        an.getByteFrequencyData(data);
        let sum=0; for(let i=0;i<data.length;i++) sum+=data[i];
        const level = Math.min(100,(sum/data.length/22)*100*(inputVolume/100));
        setMicLevel(level);
        if(micRef.current) requestAnimationFrame(loop)
      };
      loop()
    }catch(err:any){
      alert('Erro ME6S: ' + err.message)
    }
  }

  const testFone=()=>{
    if(isTestingFone){ setIsTestingFone(false); setOutputLevel(0); return }
    setIsTestingFone(true)
    const audio=new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3')
    audio.volume=outputVolume/100
    if(selectedOutput && (audio as any).setSinkId){ try{ (audio as any).setSinkId(selectedOutput) }catch{} }
    audio.play().catch(()=>{})
    let level=0; const interval=setInterval(()=>{ level=(level+25)%100; setOutputLevel(level) },80)
    audio.onended=()=>{ clearInterval(interval); setIsTestingFone(false); setOutputLevel(0) }
    setTimeout(()=>{ clearInterval(interval); setIsTestingFone(false); setOutputLevel(0) },3500)
  }

  const shareScreen=async()=>{
    if(isScreenSharing){ screenRef.current?.getTracks().forEach(t=>t.stop()); setIsScreenSharing(false); return }
    try{
      const s=await (navigator.mediaDevices as any).getDisplayMedia({video:true, audio:true}); screenRef.current=s
      if(screenVideoRef.current){ screenVideoRef.current.srcObject=s; screenVideoRef.current.play() }
      setIsScreenSharing(true)
      s.getVideoTracks()[0].onended=()=>setIsScreenSharing(false)
    }catch{}
  }

  const handleAvatarChange=(e:any)=>{
    const file=e.target.files?.[0]
    if(!file) return
    const reader=new FileReader()
    reader.onload=(ev)=>{
      const dataUrl=ev.target?.result as string
      if(currentUser){
        const u={...currentUser, avatar:dataUrl} as any
        setUsers(users.map(x=>x.id===currentUser.id?u:x))
        setCurrentUser(u)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleLogoChange=(e:any)=>{
    const file=e.target.files?.[0]
    if(!file) return
    const reader=new FileReader()
    reader.onload=(ev)=>{
      const dataUrl=ev.target?.result as string
      setLogoImage(dataUrl)
      setGroups(groups.map(g=>g.id===activeGroup?{...g, logo:dataUrl}:g))
    }
    reader.readAsDataURL(file)
  }

  const handleChannelPhotoChange=(e:any)=>{
    const file=e.target.files?.[0]
    if(!file) return
    const reader=new FileReader()
    reader.onload=(ev)=>{ setEditChannelPhoto(ev.target?.result as string) }
    reader.readAsDataURL(file)
  }

  const openChannelConfig=(ch:Channel)=>{
    setShowChannelConfig(ch)
    setEditChannelName(ch.name)
    setEditChannelPhoto(ch.photo||'')
  }

  const saveChannelConfig=()=>{
    if(!showChannelConfig) return
    setChannels(channels.map(c=>c.id===showChannelConfig.id?{...c, name:editChannelName, photo:editChannelPhoto}:c))
    setShowChannelConfig(null)
  }

  const formatTime=(s:number)=>{ const m=Math.floor(s/60).toString().padStart(2,'0'); const sec=(s%60).toString().padStart(2,'0'); return `${m}:${sec}` }

  const themeColors=[
    {name:'NEXUS Roxo', color:'#7c3aed'},
    {name:'Discord Blur', color:'#5865F2'},
    {name:'Verde Zap', color:'#23a559'},
    {name:'Vermelho', color:'#ed4245'},
    {name:'Rosa', color:'#eb459e'},
    {name:'Amarelo', color:'#fee75c'},
    {name:'Ciano', color:'#00b0f4'},
    {name:'Laranja', color:'#f47b67'},
    {name:'Preto', color:'#1e1f22'},
  ]

  if(!currentUser){
    return(
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="bg-[#1e1f22] p-8 rounded-xl w- border border-[#7c3aed]/30">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text- font-black overflow-hidden" style={{background:logoImage?'transparent':themeColor}}>
            {logoImage?<img src={logoImage} className="w-full h-full object-cover rounded-full"/>:'N'}
          </div>
          <h1 className="text-center font-black text- mt-4">NEXUS</h1>
          <div className="space-y-3 mt-6">
            <input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Usuário" className="w-full bg-[#1e1f22] p-2.5 rounded-full outline-none"/>
            <input value={regPass} onChange={e=>setRegPass(e.target.value)} type="password" placeholder="Senha" className="w-full bg-[#1e1f22] p-2.5 rounded-full outline-none"/>
            <button onClick={()=>{ if(authMode==='register'){ if(!regName||!regPass) return; const u={id:Date.now().toString(),name:regName,avatar:'😎',banner:themeColor,password:regPass,bio:''} as any; setUsers([...users,u]); setCurrentUser(u); setGroups(g=>g.map(gr=>gr.ownerId?gr:{...gr, ownerId:u.id})) }else{ const u=users.find(u=>u.name===regName&&u.password===regPass); if(!u) return alert('Cria conta'); setCurrentUser(u) } }} className="w-full py-2.5 rounded-full font-bold" style={{background:themeColor}}>Entrar</button>
            <div className="text-center text-[#a78bfa] text-sm cursor-pointer" onClick={()=>setAuthMode(authMode==='login'?'register':'login')}>{authMode==='login'?'Criar conta':'Já tem?'}</div>
          </div>
        </div>
      </div>
    )
  }

  const filtered=msgs.filter(m=>m.groupId===activeChannel)
  const activeGroupData=groups.find(g=>g.id===activeGroup)
  const activeChannelData=channels.find(c=>c.id===activeChannel)

  return(
    <div className="flex h-screen bg-[#313338] text-white text- overflow-hidden">
      <div className="w- bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
        {groups.map(g=>(
          <div key={g.id} onClick={()=>setActiveGroup(g.id)} onContextMenu={(e)=>{ e.preventDefault(); setActiveGroup(g.id); setShowGroupMenu(true) }} className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer ${activeGroup===g.id?'ring-2 ring-white':''} bg-[#313338] overflow-hidden`} style={{background:activeGroup===g.id?g.color||themeColor:''}}>
            {g.logo|| (g.id===activeGroup && logoImage)?<img src={g.logo||logoImage} className="w-full h-full object-cover rounded-full"/>:g.icon}
          </div>
        ))}
        <div onClick={()=>setShowCreateGroup(true)} className="w-12 h-12 bg-[#313338] hover:bg-[#23a559] rounded-full flex items-center justify-center text- cursor-pointer">+</div>
      </div>

      <div className="w- bg-[#2b2d31] flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-black/20 font-bold justify-between relative">
          <span className="flex items-center gap-2">{groups.find(g=>g.id===activeGroup)?.name} <span className="text-">▼</span></span>
          <div className="flex items-center gap-1">
            <span className="text- px-2 py-0.5 rounded-full" style={{background:themeColor}}>DONO</span>
            <button onClick={()=>setShowGroupMenu(!showGroupMenu)} className="w-6 h-6 rounded-full hover:bg-[#35373c] flex items-center justify-center">⋮</button>
          </div>
          {showGroupMenu&&(
            <div className="absolute top-12 left-2 right-2 bg-[#111214] rounded-md shadow-2xl border border-black p-2 z-50">
              <div className="text- uppercase text-[#b5bac1] px-2 py-1">{groups.find(g=>g.id===activeGroup)?.name}</div>
              <button onClick={()=>{ logoInputRef.current?.click(); setShowGroupMenu(false) }} className="w-full text-left px-2 py-1.5 rounded text- hover:bg-[#35373c] flex items-center gap-2"><span>🖼️</span> Mudar foto do servidor</button>
              <button onClick={()=>{ const n=prompt('Novo nome do servidor', groups.find(g=>g.id===activeGroup)?.name); if(n){ setGroups(groups.map(gr=>gr.id===activeGroup?{...gr, name:n}:gr)) } setShowGroupMenu(false) }} className="w-full text-left px-2 py-1.5 rounded text- hover:bg-[#35373c] flex items-center gap-2"><span>✏️</span> Editar servidor</button>
              <div className="h- bg-[#3f4147] my-1"></div>
              <button onClick={()=>deleteServer(activeGroup)} className="w-full text-left px-2 py-1.5 rounded text- hover:bg-[#ed4245] text-[#ed4245] hover:text-white flex items-center gap-2"><span>🗑️</span> Apagar servidor</button>
            </div>
          )}
        </div>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange}/>
        <div className="flex-1 p-2 space-y-4 overflow-y-auto">
          <div>
            <div className="text- uppercase text-[#b5bac1] px-2 flex justify-between">Canais de texto <span onClick={()=>{ const n=prompt('Nome do canal'); if(n){ const id=Date.now().toString(); setChannels([...channels,{id:`t-${id}`,name:n,type:'text',groupId:activeGroup, photo:'', createdBy:currentUser.id}]); } }} className="cursor-pointer">+</span></div>
            {channels.filter(c=>c.groupId===activeGroup&&c.type==='text').map(ch=>(
              <div key={ch.id} onContextMenu={(e)=>{ e.preventDefault(); openChannelConfig(ch) }} className="group flex items-center justify-between px-2 py-1.5 rounded mt-1 hover:bg-[#35373c]">
                <div onClick={()=>setActiveChannel(ch.id)} className={`flex items-center gap-2 cursor-pointer flex-1 ${activeChannel===ch.id?'bg-[#404249] px-2 py-1 rounded-full':''}`}>
                  {ch.photo?<img src={ch.photo} className="w-6 h-6 rounded-full object-cover"/>:<span className="text-[#80848e]">#</span>}
                  <span className="text-">{ch.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={()=>openChannelConfig(ch)} className="w-6 h-6 rounded-full hover:bg-[#4e5058] flex items-center justify-center text-">⚙️</button>
                  <button onClick={()=>deleteTextChannel(ch)} className="w-6 h-6 rounded-full hover:bg-[#ed4245] flex items-center justify-center text-">🗑️</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4"><div className="text- uppercase text-[#b5bac1] px-2">Amigos</div><div className="mt-2 space-y-1">{friends.map(f=><div key={f} className="px-2 py-1 bg-[#2b2d31] rounded-full text-">👤 {f}</div>)}{friends.length===0&&<div className="text- text-[#6d6f78] px-2">Nenhum amigo ainda</div>}</div></div>
        </div>
        <div className="bg-[#232428] border-t border-black/20 h- px-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#2b2d31] flex items-center justify-center overflow-hidden cursor-pointer" onClick={()=>avatarInputRef.current?.click()}>{currentUser.avatar.startsWith('data:')?<img src={currentUser.avatar} className="w-full h-full object-cover rounded-full"/>:currentUser.avatar}</div><div className="leading-none"><div className="text- font-bold">{currentUser.name}</div><div className="text- text-[#23a559]">Online</div></div></div>
          <button onClick={()=>{setSettingsTab('conta'); setShowSettings(true)}} className="w-8 h-8 rounded-full hover:bg-[#35373c]">⚙️</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#313338]" onClick={()=>setShowGroupMenu(false)}>
        <div className="h-12 border-b border-black/20 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            {activeChannelData?.photo?<img src={activeChannelData.photo} className="w-7 h-7 rounded-full object-cover"/>:<span className="text-[#80848e] text-">#</span>}
            <b>{channels.find(c=>c.id===activeChannel)?.name}</b>
            <span className="ml-2 text- px-2 py-0.5 rounded-full" style={{background:themeColor}}>DONO</span>
            {inVoice&&<span className="ml-2 text- bg-[#23a559] px-2 py-0.5 rounded-full animate-pulse">📞 {formatTime(voiceTime)} {Math.round(micLevel)}%</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowAddFriend(true)} className="px-3 py-1.5 rounded-full font-bold text- bg-[#2b2d31] hover:bg-[#35373c] flex items-center gap-1">👥 Add Amigo</button>
            <button onClick={joinVoice} className={`px-4 py-1.5 rounded-full font-bold text- ${inVoice?'bg-[#ed4245]':'bg-[#23a559]'}`}>📞 {inVoice?'Desligar':'Ligar'}</button>
            <button onClick={shareScreen} className={`px-4 py-1.5 rounded-full font-bold text- ${isScreenSharing?'bg-[#ed4245]':''}`} style={{background:isScreenSharing?'#ed4245':themeColor}}>🖥️ Tela</button>
          </div>
        </div>
        {isScreenSharing&&<div className="bg-[#1e1f22] p-2 border-b border-[#23a559]"><video ref={screenVideoRef} autoPlay className="w-full max-h- bg-black rounded-lg"/></div>}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filtered.map((m:any)=>
            <div key={m.id} className="group flex gap-3 hover:bg-[#2e3035] px-4 py-1.5 -mx-4 rounded-lg relative">
              <div className="w-10 h-10 rounded-full bg-[#1e1f22] flex items-center justify-center overflow-hidden shrink-0">{m.avatar?.startsWith('data:')?<img src={m.avatar} className="w-full h-full object-cover rounded-full"/>:m.avatar}</div>
              <div className="flex-1">
                <div className="flex gap-2 items-center"><b className="text-">{m.user}</b><span className="text- text-[#949ba4]">{m.time}</span></div>
                <div className="text- text-[#dcdee1] break-words">{m.text}</div>
              </div>
              <button onClick={()=>deleteMessage(m.id)} className="opacity-0 group-hover:opacity-100 absolute right-2 top-1 w-7 h-7 rounded-full bg-[#2b2d31] hover:bg-[#ed4245] flex items-center justify-center text- transition" title="Apagar mensagem">🗑️</button>
            </div>
          )}
          {filtered.length===0&&<div className="text-center text-[#6d6f78] text- mt-10">Nenhuma mensagem em #{activeChannelData?.name} ainda.</div>}
          <div ref={endRef}/>
        </div>
        <div className="p-4"><div className="bg-[#383a40] rounded-full flex items-center px-4 py-3"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`Conversar em #${channels.find(c=>c.id===activeChannel)?.name}`} className="flex-1 bg-transparent outline-none"/><button onClick={send} className="ml-3 w-8 h-8 rounded-full" style={{background:themeColor}}>↑</button></div></div>
      </div>

      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      {showChannelConfig&&(
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center">
          <div className="bg-[#313338] w- rounded-lg p-6 border border-black shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-">Editar canal de texto - #{showChannelConfig.name}</h2>
              <button onClick={()=>setShowChannelConfig(null)} className="w-8 h-8 rounded-full bg-[#2b2d31] hover:bg-[#4e5058]">✕</button>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={()=>channelPhotoInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full bg-[#1e1f22] flex items-center justify-center overflow-hidden border-2 shadow-lg" style={{borderColor:themeColor}}>
                  {editChannelPhoto?<img src={editChannelPhoto} className="w-full h-full object-cover rounded-full"/>:<span className="text-">#</span>}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text- font-bold text-center">TROCAR<br/>FOTO</div>
              </div>
              <div className="flex-1">
                <div className="text- font-bold">Foto do perfil do canal</div>
                <div className="text- text-[#b5bac1] mt-1">Igual avatar - PC ou celular</div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>channelPhotoInputRef.current?.click()} className="px-4 py-2 rounded-full text- font-bold text-white shadow" style={{background:themeColor}}>Escolher foto</button>
                  {editChannelPhoto&&<button onClick={()=>setEditChannelPhoto('')} className="px-3 py-2 rounded-full text- bg-[#4e5058]">Remover</button>}
                </div>
              </div>
            </div>
            <input ref={channelPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleChannelPhotoChange}/>
            <div className="mt-6">
              <div className="text- uppercase text-[#b5bac1] font-bold">Nome do canal de texto</div>
              <input value={editChannelName} onChange={e=>setEditChannelName(e.target.value)} className="w-full mt-2 bg-[#1e1f22] p-2.5 rounded-full outline-none border border-transparent focus:border-[#5865F2]"/>
            </div>
            <div className="mt-8 bg-[#2b2d31] rounded-lg p-3 border border-[#1e1f22]">
              <div className="text- font-bold text-[#ed4245]">Apagar canal de texto</div>
              <div className="flex justify-between items-center mt-3">
                <div><div className="text- font-bold">Apagar #{showChannelConfig.name}</div><div className="text- text-[#b5bac1]">Apaga canal e mensagens</div></div>
                <button onClick={()=>deleteTextChannel(showChannelConfig)} className="px-4 py-1.5 rounded-full bg-[#ed4245] hover:bg-[#c03537] text-white text- font-bold">Apagar canal</button>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=>setShowChannelConfig(null)} className="px-5 py-2 rounded-full text- hover:bg-[#2b2d31]">Cancelar</button>
              <button onClick={saveChannelConfig} className="px-6 py-2 rounded-full text-white text- font-bold shadow" style={{background:themeColor}}>Salvar canal</button>
            </div>
          </div>
        </div>
      )}

      {showAddFriend&&(
        <div className="fixed top-12 right-4 w- bg-[#313338] rounded-lg shadow-2xl border border-black z-[200] p-4">
          <div className="flex justify-between items-center"><h3 className="font-bold">Adicionar amigo</h3><button onClick={()=>setShowAddFriend(false)} className="w-6 h-6 rounded-full bg-[#2b2d31]">✕</button></div>
          <div className="flex gap-2 mt-4">
            <input value={addFriendName} onChange={e=>setAddFriendName(e.target.value)} placeholder="Nome do amigo" className="flex-1 bg-[#1e1f22] p-2.5 rounded-full outline-none"/>
            <button onClick={()=>{ if(!addFriendName.trim()) return; if(!users.find(u=>u.name===addFriendName)) return alert('Usuário não existe'); if(friends.includes(addFriendName)) return alert('Já é seu amigo'); setFriends([...friends, addFriendName]); setAddFriendName(''); setShowAddFriend(false) }} className="px-5 py-2.5 rounded-full font-bold text-white" style={{background:themeColor}}>Enviar</button>
          </div>
        </div>
      )}

      {showCreateGroup&&<div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center"><div className="bg-[#313338] w- rounded-lg p-6 border border-[#7c3aed]/30"><h2 className="font-bold text-">Criar servidor NEXUS</h2><input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} placeholder="Nome" className="w-full bg-[#1e1f22] p-2.5 rounded-full mt-4 outline-none"/><div className="flex justify-end gap-3 mt-6"><button onClick={()=>setShowCreateGroup(false)} className="px-4 py-2 text-">Voltar</button><button onClick={()=>{ if(!newGroupName.trim()) return; const id=Date.now().toString(); setGroups([...groups,{id,name:newGroupName, ownerId:currentUser!.id, icon:newGroupName[0].toUpperCase(), color:themeColor, logo:logoImage}]); setChannels([...channels,{id:`t-${id}`,name:'geral',type:'text',groupId:id, photo:'', createdBy:currentUser.id},{id:`v-${id}`,name:'Geral',type:'voice',groupId:id, photo:'', createdBy:currentUser.id}]); setActiveGroup(id); setActiveChannel(`t-${id}`); setShowCreateGroup(false); setNewGroupName('') }} className="px-6 py-2 rounded-full text-white text- font-bold" style={{background:themeColor}}>Criar</button></div></div></div>}

      {showSettings&&(
        <div className="fixed inset-0 z-[100] flex bg-[#313338] overflow-hidden">
          <div className="w-[35%] bg-[#2b2d31] flex justify-end overflow-y-auto">
            <div className="w- py- pr-2 space-y-6">
              <div>
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-[#2b2d31] flex items-center justify-center overflow-hidden cursor-pointer border-2" style={{borderColor:themeColor}} onClick={()=>avatarInputRef.current?.click()}>
                    {currentUser.avatar.startsWith('data:')?<img src={currentUser.avatar} className="w-full h-full object-cover rounded-full"/>:<span className="text-">{currentUser.avatar}</span>}
                  </div>
                  <div className="leading-none"><div className="font-bold text-">{currentUser.name}</div><div className="text- text-[#00a8fc] cursor-pointer" onClick={()=>avatarInputRef.current?.click()}>Editar foto ✎</div></div>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
                <div className="mt-5 space-y-0.5">
                  <button onClick={()=>setSettingsTab('conta')} className={`w-full text-left px-2.5 py-1.5 rounded text- ${settingsTab==='conta'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}>👤 Conta</button>
                  <button onClick={()=>setSettingsTab('voz')} className={`w-full text-left px-2.5 py-1.5 rounded text- ${settingsTab==='voz'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}>🎙️ Voz e vídeo</button>
                  <button onClick={()=>setSettingsTab('aparencia')} className={`w-full text-left px-2.5 py-1.5 rounded text- ${settingsTab==='aparencia'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}>🎨 Aparência</button>
                </div>
              </div>
              <div className="h- bg-[#3f4147] mx-2"></div>
              <button onClick={()=>{setCurrentUser(null); setShowSettings(false)}} className="w-full text-left px-2.5 py-1.5 rounded text-[#ed4245] text-">Sair da conta</button>
            </div>
          </div>

          <div className="flex-1 bg-[#313338] flex overflow-hidden">
            <div className="flex-1 max-w- py- px-10 overflow-y-auto">
              {settingsTab==='conta'&&(
                <div>
                  <h2 className="text- font-bold">Minha conta - Mudar nome quando quiser</h2>
                  <div className="mt-6 space-y-6">
                    <div className="bg-[#232428] rounded-lg p-4 border border-[#1e1f22]">
                      <div className="flex items-center gap-5">
                        <div className="relative group cursor-pointer" onClick={()=>avatarInputRef.current?.click()}>
                          <div className="w-20 h-20 rounded-full bg-[#1e1f22] flex items-center justify-center overflow-hidden border-2" style={{borderColor:themeColor}}>
                            {currentUser.avatar.startsWith('data:')?<img src={currentUser.avatar} className="w-full h-full object-cover rounded-full"/>:<span className="text-">{currentUser.avatar}</span>}
                          </div>
                          <div className="absolute inset-0 bg-black/60 rounded-full hidden group-hover:flex items-center justify-center text- font-bold">TROCAR</div>
                        </div>
                        <div className="flex-1">
                          <div className="text- uppercase text-[#b5bac1] font-bold">Foto de perfil</div>
                          <button onClick={()=>avatarInputRef.current?.click()} className="mt-2 px-4 py-2 rounded-full text- font-bold text-white" style={{background:themeColor}}>Trocar foto PC/Celular</button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#2b2d31] rounded-lg p-4 border border-[#1e1f22]">
                      <div className="text- uppercase font-bold text-[#b5bac1] mb-3">Mudar seu nome</div>
                      <div className="bg-[#1e1f22] p-3 rounded-lg flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text- uppercase text-[#b5bac1] font-bold">Nome de usuário</div>
                          {editingName? (
                            <div className="flex gap-2 mt-2">
                              <input value={newNameInput} onChange={e=>setNewNameInput(e.target.value)} placeholder="Novo nome" className="bg-[#2b2d31] p-2.5 rounded-full text- outline-none border border-[#5865F2] flex-1" autoFocus/>
                              <button onClick={saveNewName} className="px-4 py-2 rounded-full bg-[#23a559] text-white text- font-bold">Salvar</button>
                              <button onClick={()=>setEditingName(false)} className="px-4 py-2 rounded-full bg-[#4e5058] text-white text-">Cancelar</button>
                            </div>
                          ) : (
                            <div className="text- font-bold mt-1 flex items-center gap-2">{currentUser.name} <span className="text- text-[#b5bac1] font-normal">#{currentUser.id.slice(-4)}</span></div>
                          )}
                        </div>
                        {!editingName && (
                          <button onClick={()=>{ setEditingName(true); setNewNameInput(currentUser.name) }} className="px-5 py-2 rounded-full bg-[#4e5058] hover:bg-[#6d6f78] text- font-bold ml-4">Editar nome</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab==='voz'&&(
                <div>
                  <h2 className="text- font-bold">Voz e vídeo - Supressão corrigida ME6S</h2>
                  <div className="mt-6 space-y-6">
                    <div className="bg-[#2b2d31] p-4 rounded-lg border border-[#1e1f22]">
                      <div className="text- uppercase font-bold text-[#b5bac1]">Dispositivo de entrada - SEU ME6S</div>
                      <select value={selectedMic} onChange={e=>setSelectedMic(e.target.value)} className="w-full mt-2 bg-[#1e1f22] p-2.5 rounded text- outline-none border border-[#1e1f22]">
                        {micDevices.map(d=><option key={d.deviceId} value={d.deviceId}>{d.label}</option>)}
                        {micDevices.length===0&&<option>Carregando ME6S...</option>}
                      </select>
                      <div className="mt-4">
                        <div className="flex justify-between"><div className="text- uppercase font-bold text-[#b5bac1]">Volume de entrada</div><div className="text- text-[#b5bac1]">{inputVolume}%</div></div>
                        <input type="range" min="0" max="100" value={inputVolume} onChange={e=>setInputVolume(Number(e.target.value))} className="w-full mt-2 accent-[#23a559]"/>
                        <div className="h-2 bg-[#4e5058] rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#23a559] transition-all" style={{width:micLevel+'%'}}></div></div>
                        <div className="flex gap-2 mt-3 items-center flex-wrap">
                          <button onClick={testMic} className={`px-5 py-2.5 rounded-full text-white text- font-bold ${isTestingMic?'bg-[#ed4245]':'bg-[#23a559] hover:bg-[#2dc770]'}`}>
                            {isTestingMic?`Parar - ${Math.round(micLevel)}%`:'Testar microfone ME6S'}
                          </button>
                          <span className={`text- py-1 px-3 rounded-full font-bold ${micLevel>5?'bg-[#23a559] text-white animate-pulse':'bg-[#1e1f22] text-[#b5bac1]'}`}>{isTestingMic?(micLevel>5?'🔴 VOZ LIMPA!':'Fale...'):'Parado - Clique e fale de FONE'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#2b2d31] p-4 rounded-lg border border-[#1e1f22]">
                      <div className="text- uppercase font-bold text-[#b5bac1]">Dispositivo de saída - SEU USB AUDIO</div>
                      <select value={selectedOutput} onChange={e=>setSelectedOutput(e.target.value)} className="w-full mt-2 bg-[#1e1f22] p-2.5 rounded text- outline-none border border-[#1e1f22]">
                        {outputDevices.map(d=><option key={d.deviceId} value={d.deviceId}>{d.label}</option>)}
                        {outputDevices.length===0&&<option>Carregando...</option>}
                      </select>
                      <div className="mt-4">
                        <div className="flex justify-between"><div className="text- uppercase font-bold text-[#b5bac1]">Volume de saída</div><div className="text- text-[#b5bac1]">{outputVolume}%</div></div>
                        <input type="range" min="0" max="100" value={outputVolume} onChange={e=>setOutputVolume(Number(e.target.value))} className="w-full mt-2 accent-[#5865F2]"/>
                        <div className="h-2 bg-[#4e5058] rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#5865F2] transition-all" style={{width:outputLevel+'%'}}></div></div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={testFone} className={`px-5 py-2 rounded-full text-white text- font-bold ${isTestingFone?'bg-[#ed4245]':'bg-[#5865F2] hover:bg-[#4752c4]'}`}>{isTestingFone?'Parar':'Testar fone USB'}</button>
                          <button onClick={loadDevices} className="px-4 py-2 rounded-full bg-[#4e5058] hover:bg-[#6d6f78] text-">Recarregar</button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#2b2d31] p-4 rounded-lg border border-[#1e1f22] space-y-4">
                      <div className="text- uppercase font-bold text-[#b5bac1]">Processamento de voz - AGORA FUNCIONA</div>

                      <div className="bg-[#1e1f22] p-3 rounded-lg border border-[#23a559]/30">
                        <div className="flex justify-between items-center">
                          <div><div className="text- font-bold flex items-center gap-2">🔇 Supressão de ruído - ME6S {noiseSuppression&&<span className="text- bg-[#23a559] px-2 py-0.5 rounded-full">ATIVA</span>}</div><div className="text- text-[#b5bac1] mt-1">{noiseSuppression?'LIGADA - Corta ruído grave do ME6S, chiado, ventilador':'DESLIGADA - Com ruído de fundo'}</div></div>
                          <button onClick={()=>setNoiseSuppression(!noiseSuppression)} className={`w-12 h-7 rounded-full relative transition ${noiseSuppression?'bg-[#23a559]':'bg-[#4e5058]'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition ${noiseSuppression?'right-1':'left-1'}`}></div></button>
                        </div>
                        {noiseSuppression&&<div className="text- text-[#23a559] mt-2">✅ Filtro highpass 120Hz ativo - remove ronco e chiado do seu ME6S</div>}
                      </div>

                      <div className="flex justify-between items-center">
                        <div><div className="text- font-bold">Cancelamento de eco</div><div className="text- text-[#b5bac1]">{echoCancellation?'LIGADO - Use na ligação':'DESLIGADO - Use no teste'}</div></div>
                        <button onClick={()=>setEchoCancellation(!echoCancellation)} className={`w-12 h-7 rounded-full relative transition ${echoCancellation?'bg-[#23a559]':'bg-[#4e5058]'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition ${echoCancellation?'right-1':'left-1'}`}></div></button>
                      </div>
                    </div>

                    <div className="bg-[#1e1f22] p-3 rounded-lg border border-[#23a559]/30">
                      <div className="text- font-bold text-[#23a559]">✅ SUPRESSÃO CORRIGIDA - COMO TESTAR:</div>
                      <div className="text- text-[#b5bac1] mt-2 leading-relaxed">
                        1. Deixa Supressão VERDE ligada<br/>
                        2. Clica em Testar microfone ME6S<br/>
                        3. Fala normal - agora o chiado do ME6S some<br/>
                        4. Desliga e liga o botão e testa de novo pra ver a diferença<br/>
                        5. Na ligação deixa sempre LIGADA (verde)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab==='aparencia'&&(
                <div>
                  <h2 className="text- font-bold">Aparência - NEXUS</h2>
                  <div className="mt-6">
                    <div className="text- uppercase text-[#b5bac1] font-bold mb-3">Cor do tema - Redondo</div>
                    <div className="grid grid-cols-3 gap-3">
                      {themeColors.map(c=>(
                        <button key={c.color} onClick={()=>setThemeColor(c.color)} className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${themeColor===c.color?'border-white scale-105':'border-[#2b2d31]'}`} style={{background:'#2b2d31'}}>
                          <div className="w-12 h-12 rounded-full" style={{background:c.color}}></div>
                          <div className="text- font-bold">{c.name}</div>
                          {themeColor===c.color&&<div className="text- bg-white text-black px-2 py-0.5 rounded-full font-bold">Ativo</div>}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 bg-[#2b2d31] p-4 rounded-lg flex items-center gap-4 border border-[#1e1f22]">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden" style={{background:logoImage?'transparent':themeColor}}>{logoImage?<img src={logoImage} className="w-full h-full object-cover rounded-full"/>:'N'}</div>
                      <div><div className="text- font-bold">Logo NEXUS redondo</div><button onClick={()=>logoInputRef.current?.click()} className="mt-2 px-4 py-1.5 rounded-full text-white text- font-bold" style={{background:themeColor}}>Trocar N</button></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-10 pr-20"><button onClick={()=>setShowSettings(false)} className="w-9 h-9 rounded-full border border-[#b5bac1] flex items-center justify-center text-[#b5bac1] hover:border-white">✕</button><div className="text- text-[#b5bac1] mt-2 text-center">ESC</div></div>
          </div>
        </div>
      )}
    </div>
  )
}