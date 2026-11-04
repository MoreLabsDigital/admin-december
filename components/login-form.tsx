"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, type ActionResult } from "@/app/actions";
import { ArrowRight, LoaderCircle } from "lucide-react";
const initial:ActionResult={};
export function LoginForm(){
 const [state,action,pending]=useActionState(signIn,initial);const router=useRouter();
 useEffect(()=>{if(state.success){router.replace("/events");router.refresh();}},[state.success,router]);
 return <form action={action} className="login-form"><label htmlFor="email">EMAIL ADDRESS</label><input required id="email" name="email" type="email" autoComplete="email" placeholder="admin@example.com"/><label htmlFor="password">PASSWORD</label><input required id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••••"/>{state.error&&<div className="form-error" role="alert">{state.error}</div>}<button type="submit" disabled={pending} className="button button-black login-submit">{pending?"Signing in…":"Sign in to dashboard"}{pending?<LoaderCircle size={17} className="spin"/>:<ArrowRight size={18}/>}</button></form>;
}
