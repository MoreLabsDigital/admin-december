"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutGrid,
  CalendarDays,
  Plus,
  LogOut,
  ExternalLink,
  Disc3,
} from "lucide-react";
import { signOut } from "@/app/actions";
export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const active = pathname === "/events";
  return (
    <aside className="sidebar">
      <div>
        <Link href="/events" className="sidebar-logo">
          <Image
            src="/images/logo (2).png"
            alt="Detty December"
            width={1440}
            height={540}
          />
          <small>ADMIN STUDIO</small>
        </Link>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="side-nav">
          <Link
            href="/events"
            className={active ? "nav-link active" : "nav-link"}
          >
            <LayoutGrid size={18} /> Overview
          </Link>
          <Link
            href="/events/new"
            className={
              pathname === "/events/new" ? "nav-link active" : "nav-link"
            }
          >
            <Plus size={18} /> Add new event
          </Link>
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">COLLECTION</div>
        <div className="side-info">
          <CalendarDays size={17} /> Lagos events <span className="tiny-dot" />
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="editorial-mark">
          <Disc3 size={28} strokeWidth={1.2} />
          <div>
            CURATE
            <br />
            THE CULTURE.
          </div>
        </div>
        <div className="sidebar-user">
          <div className="avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small title={email}>{email}</small>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="signout">
            <LogOut size={17} /> Sign out <ExternalLink size={13} />
          </button>
        </form>
      </div>
    </aside>
  );
}
