import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";
export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-brand">
        <Image
          src="/images/logo (2).png"
          alt="Detty December"
          width={1440}
          height={540}
          className="brand-mark"
        />
        <div className="brand-statement">
          THE NIGHT
          <br />
          STARTS
          <br />
          <em>HERE.</em>
        </div>
        <div className="brand-bottom">
          DETTY DECEMBER <span>© 2026</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-top">
          <LockKeyhole size={15} /> PRIVATE ACCESS ONLY
        </div>
        <div className="login-form-wrap">
          <span className="overline">ADMINISTRATOR PORTAL — 01</span>
          <h1>
            Welcome
            <br />
            back<span className="dot">.</span>
          </h1>
          <p>
            Sign in to manage your events. This portal is restricted to one
            approved administrator.
          </p>
          <LoginForm />
        </div>
        <div className="login-footer">
          SECURE ACCESS 
        </div>
      </section>
    </main>
  );
}
