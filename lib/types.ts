export type EventRecord = {
 id: string; title: string; slug: string; description: string | null;
 category: string | null; venue: string | null; address: string | null;
 city: string; event_date: string; start_time: string | null; end_time: string | null;
 price_min: number | null; currency: string; image_url: string | null;
 ticket_url: string | null; organizer: string | null; source: string;
 is_published: boolean; created_at: string; updated_at: string;
};
export const CATEGORIES = ["Music","Nightlife","Arts","Food","Experiences"] as const;
export function formatDate(date: string) {
 if (!date) return "—";
 return new Intl.DateTimeFormat("en-NG",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(`${date}T12:00:00Z`));
}
export function formatPrice(price: number|null) {
 return price == null ? "Not listed" : price === 0 ? "Free" : `₦${price.toLocaleString("en-NG")}`;
}
