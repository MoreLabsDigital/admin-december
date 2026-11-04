import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { EventForm } from "@/components/event-form";
import type { EventRecord } from "@/lib/types";
export default async function EditEventPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {supabase}=await requireAdmin();
 const {data,error}=await supabase.from("events").select("*").eq("id",id).single();
 if(error||!data)notFound();
 return <EventForm event={data as EventRecord}/>;
}
