import { signOut } from "@/app/actions";
export default function Unauthorized(){return <main className="center-page"><div className="auth-card"><div className="eyebrow">ACCESS DENIED</div><h1>Restricted account.</h1><p>This account is not on the administrator allowlist.</p><form action={signOut}><button className="button button-black">Sign out</button></form></div></main>}
