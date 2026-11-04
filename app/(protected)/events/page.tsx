import Link from "next/link";
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  Search,
  ArrowRight,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { EventList } from "@/components/event-list";
import type { EventRecord } from "@/lib/types";
export default async function EventsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false })
    .limit(1000);
  const events = (data || []) as EventRecord[];
  const published = events.filter((e) => e.is_published).length;
  const upcoming = events.filter(
    (e) =>
      e.event_date >=
      new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" }),
  ).length;
  return (
    <div className="content">
      <header className="topbar">
        <div className="breadcrumb">
          WORKSPACE <span>/</span> EVENTS
        </div>
        <div className="topbar-right">
          <span className="status-dot" /> ADMIN SESSION ACTIVE
        </div>
      </header>
      <div className="page-inner">
        <div className="heading-row">
          <div>
            <div className="overline">THE CONTROL ROOM / 001</div>
            <h1 className="page-title">
              Your events<span className="dot">.</span>
            </h1>
            <p className="page-subtitle">
              Everything happening, all in one place.
            </p>
          </div>
          <Link href="/events/new" className="button button-black">
            <Plus size={18} /> Add event
          </Link>
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <span>
              TOTAL EVENTS <CalendarDays size={17} />
            </span>
            <strong>{events.length.toString().padStart(2, "0")}</strong>
            <small>In your collection</small>
          </div>
          <div className="stat-card">
            <span>
              LIVE NOW <CheckCircle2 size={17} />
            </span>
            <strong>{published.toString().padStart(2, "0")}</strong>
            <small>Published events</small>
          </div>
          <div className="stat-card">
            <span>
              UPCOMING <Clock3 size={17} />
            </span>
            <strong>{upcoming.toString().padStart(2, "0")}</strong>
            <small>Today and beyond</small>
          </div>
        </div>
        <div className="section-heading">
          <div>
            <span className="overline">EVENT LIBRARY</span>
            <h2>
              All events <span className="muted-count">({events.length})</span>
            </h2>
          </div>
          <Link href="/events/new" className="text-action">
            Create an event <ArrowUpRight size={17} />
          </Link>
        </div>
        {error ? (
          <div className="notice error">
            Could not load events: {error.message}. Run the included SQL setup
            and check your Supabase settings.
          </div>
        ) : (
          <EventList events={events} />
        )}
        <footer className="content-footer">
          <span>DETTY DECEMBER / ADMIN STUDIO</span>
          <span>
            BUILT FOR THE CULTURE <ArrowRight size={13} />
          </span>
        </footer>
      </div>
    </div>
  );
}
