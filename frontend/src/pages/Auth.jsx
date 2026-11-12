import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"

export default function Auth() {
  const [mode,setMode]=useState("login"), [form,setForm]=useState({username:"",email:"",password:""}), [error,setError]=useState("")
  const nav=useNavigate()
  const submit=async e=>{e.preventDefault();setError("");try{if(mode==="register"){await api.post("auth/register/",form);setMode("login")}else{const r=await api.post("auth/login/",{username:form.username,password:form.password});localStorage.setItem("fashion_access",r.data.access);localStorage.setItem("fashion_refresh",r.data.refresh);nav("/")}}catch(err){setError("Unable to continue. Please check your details.")}}
  return <main className="mx-auto max-w-md px-4 py-16"><div className="rounded-3xl border p-8 shadow-sm"><h1 className="text-3xl font-black">{mode==="login"?"Welcome back":"Create account"}</h1><form onSubmit={submit} className="mt-7 space-y-4"><input required placeholder="Username" className="w-full rounded-xl border p-3" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/>{mode==="register"&&<input required type="email" placeholder="Email" className="w-full rounded-xl border p-3" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>}<input required type="password" placeholder="Password" className="w-full rounded-xl border p-3" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>{error&&<p className="text-sm text-rose-600">{error}</p>}<button className="w-full rounded-xl bg-black py-3 font-bold text-white">{mode==="login"?"Login":"Register"}</button></form><button className="mt-5 text-sm underline" onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"Create a new account":"Already have an account? Login"}</button></div></main>
}
