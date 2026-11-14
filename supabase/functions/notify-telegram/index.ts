// Supabase Edge Function: notify owner about a new order.
// Secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve(async (req)=>{
  try{
    const body=await req.json();
    const token=Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chat=Deno.env.get("TELEGRAM_CHAT_ID");
    if(!token||!chat) return new Response(JSON.stringify({error:"Telegram secrets are missing"}),{status:500});
    const o=body.record;
    const text=`🛒 Новый заказ #${String(o.id).slice(0,8)}\nГород: ${o.city}\nТелефон: ${o.phone}\nСумма: ${o.total} ₽\nСтатус: создан`;
    const r=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chat,text})});
    return new Response(await r.text(),{headers:{"content-type":"application/json"}});
  }catch(e){return new Response(JSON.stringify({error:String(e)}),{status:500})}
});