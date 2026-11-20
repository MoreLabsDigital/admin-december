
"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CloudUpload,
  LoaderCircle,
  X,
} from "lucide-react";

import { saveEvent, type ActionResult } from "@/app/actions";
import { createClient } from "@/lib/supabase/browser";
import { CATEGORIES, type EventRecord } from "@/lib/types";

const initial: ActionResult = {};

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  type = "text",
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label} {required && <b>*</b>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        required={required}
      />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function EventForm({
  event,
}: {
  event?: EventRecord;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    saveEvent,
    initial
  );

  const [image, setImage] = useState(
    event?.image_url || ""
  );
  const [soldOut, setSoldOut] = useState(
    event?.is_sold_out ?? false
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.id) {
      router.push("/events");
      router.refresh();
    }
  }, [state.id, router]);

  async function upload(file: File) {
    setUploadError("");

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      setUploadError("Use JPG, PNG or WebP images only.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be smaller than 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

      const path = `event-flyers/${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage
        .from("event-images")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("event-images")
        .getPublicUrl(path);

      setImage(data.publicUrl);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="content">
      <header className="topbar">
        <div className="breadcrumb">
          WORKSPACE <span>/</span> EVENTS <span>/</span>{" "}
          {event ? "EDIT" : "NEW"}
        </div>

        <div className="topbar-right">
          <span className="status-dot" />
          ADMIN SESSION ACTIVE
        </div>
      </header>

      <div className="page-inner">
        <Link href="/events" className="back-link">
          <ArrowLeft size={16} />
          Back to events
        </Link>

        <div className="heading-row form-heading">
          <div>
            <span className="overline">
              EVENT EDITOR /{" "}
              {event ? "EDIT RECORD" : "NEW ENTRY"}
            </span>

            <h1 className="page-title">
              {event ? "Edit event" : "Create event"}
              <span className="dot">.</span>
            </h1>

            <p className="page-subtitle">
              {event
                ? "Update the details below and save your changes."
                : "Fill out the details and bring your event to life."}
            </p>
          </div>

          <span className="form-header-chip">
            {event ? "EDIT MODE" : "NEW EVENT"}
          </span>
        </div>

        <form action={action} className="editor-layout">
          <input
            type="hidden"
            name="id"
            value={event?.id || ""}
          />

          <input
            type="hidden"
            name="image_url"
            value={image}
          />

          <input
            type="hidden"
            name="is_sold_out"
            value={String(soldOut)}
          />

          <div className="editor-main">
            {/* ESSENTIAL DETAILS */}
            <section className="editor-card">
              <div className="card-title">
                <span className="section-number">01</span>
                <div>
                  <h2>Essential details</h2>
                  <p>What are we celebrating?</p>
                </div>
              </div>

              <div className="field-stack">
                <Field
                  label="Event name"
                  name="title"
                  required
                  defaultValue={event?.title}
                  placeholder="e.g. December After Dark"
                />

                <div className="field">
                  <label htmlFor="description">
                    DESCRIPTION
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    defaultValue={event?.description || ""}
                    rows={5}
                    placeholder="Tell people why this event is worth showing up for…"
                  />
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="category">
                      CATEGORY
                    </label>
                    <select
                      name="category"
                      id="category"
                      defaultValue={
                        event?.category || "Experiences"
                      }
                    >
                      {CATEGORIES.map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Field
                    label="Organizer"
                    name="organizer"
                    defaultValue={event?.organizer}
                    placeholder="Event organizer"
                  />
                </div>

                <Field
                  label="URL slug (optional)"
                  name="slug"
                  defaultValue={event?.slug}
                  placeholder="Auto-created from event name"
                  hint="Use a unique slug for the public event URL."
                />
              </div>
            </section>

            {/* DATE AND PLACE */}
            <section className="editor-card">
              <div className="card-title">
                <span className="section-number">02</span>
                <div>
                  <h2>Date & place</h2>
                  <p>When and where it all goes down.</p>
                </div>
              </div>

              <div className="field-stack">
                <div className="form-grid triple">
                  <Field
                    label="Event date"
                    name="event_date"
                    type="date"
                    required
                    defaultValue={event?.event_date}
                  />

                  <Field
                    label="Start time"
                    name="start_time"
                    type="time"
                    defaultValue={
                      event?.start_time?.slice(0, 5)
                    }
                  />

                  <Field
                    label="End time"
                    name="end_time"
                    type="time"
                    defaultValue={
                      event?.end_time?.slice(0, 5)
                    }
                  />
                </div>

                <div className="form-grid">
                  <Field
                    label="Venue"
                    name="venue"
                    defaultValue={event?.venue}
                    placeholder="e.g. Landmark Event Centre"
                  />

                  <Field
                    label="City"
                    name="city"
                    defaultValue={event?.city || "Lagos"}
                    placeholder="Lagos"
                  />
                </div>

                <Field
                  label="Address / neighbourhood"
                  name="address"
                  defaultValue={event?.address}
                  placeholder="Victoria Island, Lagos"
                />
              </div>
            </section>

            {/* TICKETS */}
            <section className="editor-card">
              <div className="card-title">
                <span className="section-number">03</span>
                <div>
                  <h2>Tickets & pricing</h2>
                  <p>
                    Send guests directly to the ticket seller.
                  </p>
                </div>
              </div>

              <div className="field-stack">
                <div className="form-grid">
                  <Field
                    label="Price from (NGN)"
                    name="price_min"
                    type="number"
                    defaultValue={
                      event?.price_min?.toString() ?? ""
                    }
                    placeholder="e.g. 15000"
                    hint="Leave empty if unknown; enter 0 for free."
                  />

                  <Field
                    label="Ticket booking URL"
                    name="ticket_url"
                    type="url"
                    defaultValue={event?.ticket_url}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="editor-side">
            {/* ARTWORK */}
            <section className="editor-card">
              <div className="card-title">
                <span className="section-number">04</span>
                <div>
                  <h2>Event artwork</h2>
                  <p>Make a first impression.</p>
                </div>
              </div>

              <div
                className="upload-zone"
                onClick={() => fileInput.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    fileInput.current?.click();
                  }
                }}
              >
                {image ? (
                  <img
                    src={image}
                    alt="Selected event flyer"
                    className="upload-preview"
                  />
                ) : (
                  <>
                    <div className="upload-icon">
                      <CloudUpload size={26} />
                    </div>

                    <strong>
                      {uploading
                        ? "Uploading…"
                        : "Click to upload flyer"}
                    </strong>

                    <small>
                      JPG, PNG, WebP · Up to 5 MB
                    </small>
                  </>
                )}

                <input
                  ref={fileInput}
                  className="visually-hidden"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void upload(file);
                  }}
                />
              </div>

              {image && (
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => setImage("")}
                >
                  <X size={14} />
                  Remove image
                </button>
              )}

              {uploadError && (
                <div className="form-error" role="alert">
                  {uploadError}
                </div>
              )}
            </section>

            {/* PUBLISHING AND SOLD OUT */}
            <section className="editor-card">
              <div className="card-title">
                <span className="section-number">05</span>
                <div>
                  <h2>Publishing</h2>
                  <p>
                    Control event visibility and ticket availability.
                  </p>
                </div>
              </div>

              <div className="info-note">
                Published events are visible to visitors.
                Drafts remain private to the admin.
              </div>

              {/* SOLD OUT TOGGLE */}
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e5e5e5",
                }}
              >
                <label
                  htmlFor="sold-out-toggle"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      SOLD OUT
                    </strong>

                    <small
                      style={{
                        display: "block",
                        marginTop: "6px",
                        color: "#777",
                        lineHeight: 1.5,
                      }}
                    >
                      {soldOut
                        ? "This event is sold out. Ticket booking will be disabled."
                        : "Tickets are currently available."}
                    </small>
                  </div>

                  <span
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "48px",
                      height: "26px",
                      flexShrink: 0,
                    }}
                  >
                    <input
                      id="sold-out-toggle"
                      type="checkbox"
                      checked={soldOut}
                      onChange={(e) =>
                        setSoldOut(e.target.checked)
                      }
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                        zIndex: 2,
                        margin: 0,
                      }}
                    />

                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "20px",
                        backgroundColor: soldOut
                          ? "#111"
                          : "#d1d1d1",
                        transition: "background 0.2s",
                      }}
                    />

                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: "3px",
                        left: soldOut ? "25px" : "3px",
                        height: "20px",
                        width: "20px",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        transition: "left 0.2s",
                      }}
                    />
                  </span>
                </label>
              </div>
            </section>

            {/* SAVE BUTTONS */}
            <div className="submit-card">
              {state.error && (
                <div
                  className="form-error"
                  role="alert"
                >
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                name="is_published"
                value="false"
                disabled={pending || uploading}
                className="button submit-button button-draft"
              >
                {pending
                  ? "Saving event…"
                  : "Save as draft"}
              </button>

              <button
                type="submit"
                name="is_published"
                value="true"
                disabled={pending || uploading}
                className="button button-black submit-button"
              >
                {pending
                  ? "Saving event…"
                  : "Publish"}

                {pending ? (
                  <LoaderCircle
                    size={17}
                    className="spin"
                  />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>

              <Link
                href="/events"
                className="cancel-link"
              >
                Cancel and go back
              </Link>
            </div>
          </aside>
        </form>

        <footer className="content-footer">
          <span>DETTY DECEMBER / ADMIN STUDIO</span>

          <span>
            CREATE SOMETHING GOOD
            <ArrowRight size={13} />
          </span>
        </footer>
      </div>
    </div>
  );
}