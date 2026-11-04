import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function requireAdmin(){
 const supabase=await createClient();
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user) redirect("/login");
 const {data:isAdmin,error:roleError}=await supabase.rpc("is_admin");
 if(roleError||!isAdmin) redirect("/unauthorized");
 return {supabase,user};
}
