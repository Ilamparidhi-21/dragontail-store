import nodemailer from 'nodemailer';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c] || c));
const formatINR = (value: number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(value)||0);
const safeOrderNumber = (value: string) => escapeHtml(value);
const siteUrl = () => {
  const candidate = process.env.STORE_PUBLIC_URL || 'https://13-207-192-30.sslip.io';
  try { const u = new URL(candidate); return u.protocol === 'https:' ? u.origin : ''; } catch { return ''; }
};
const linkButton = (label:string, path:string) => {
  const base = siteUrl();
  return base ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 4px"><tr><td bgcolor="#171717" style="border-radius:3px"><a href="${escapeHtml(base+path)}" style="display:inline-block;padding:15px 25px;color:#ffffff;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:1.4px">${escapeHtml(label)} &nbsp;↗</a></td></tr></table>` : '';
};
function template({kicker,title,description,lines,button,footnote}:{kicker:string;title:string;description:string;lines:{label:string;value:string}[];button?:string;footnote?:string}) {
 const rows=lines.map(x=>`<tr><td style="padding:11px 0;border-bottom:1px solid #ededed;color:#727272;font-size:13px;vertical-align:top">${escapeHtml(x.label)}</td><td align="right" style="padding:11px 0;border-bottom:1px solid #ededed;color:#171717;font-size:13px;font-weight:600;vertical-align:top">${escapeHtml(x.value)}</td></tr>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DRAGONTAIL</title></head><body style="margin:0;padding:0;background:#f5f5f5;color:#171717;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(description)}</div><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f5f5"><tr><td align="center" style="padding:36px 14px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:white"><tr><td bgcolor="#171717" align="center" style="padding:28px 15px"><span style="font-size:23px;letter-spacing:6px;color:#ffffff;font-weight:bold">DRAGONTAIL</span><div style="margin-top:10px;font-size:10px;letter-spacing:2px;color:#c9c9c9">CONTEMPORARY CLOTHING HOUSE</div></td></tr><tr><td style="padding:38px 36px 30px"><div style="font-size:11px;letter-spacing:2.8px;color:#666;font-weight:bold">${escapeHtml(kicker.toUpperCase())}</div><h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:normal;line-height:1.18;margin:15px 0 18px;color:#171717">${escapeHtml(title)}</h1><p style="font-size:15px;line-height:1.8;color:#505050;margin:0 0 24px">${escapeHtml(description)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #171717">${rows}</table>${button||''}${footnote?`<p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#777">${escapeHtml(footnote)}</p>`:''}</td></tr><tr><td bgcolor="#f8f8f8" style="border-top:1px solid #e9e9e9;padding:24px 36px;text-align:center"><div style="font-size:12px;font-weight:bold;letter-spacing:2.8px;color:#171717">DRAGONTAIL ✦</div><p style="font-size:11px;line-height:1.6;color:#888;margin:12px 0 0">This is a transactional message about your order.<br>© ${new Date().getFullYear()} DRAGONTAIL. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
}
const transporter = () => {
 if(!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) return null;
 return nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',requireTLS:process.env.SMTP_PORT!=='465',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});
};
export async function emailOrder(to:string,subject:string,body:string,html?:string) {
 const smtp=transporter();if(!smtp)return false;
 await smtp.sendMail({from:process.env.SMTP_FROM,to,subject,text:body,...(html?{html}:{})});
 return true;
}
export async function notifyNewOrder(order:{id:number;order_number:string;email:string;total:number}) {
 const amount=formatINR(order.total);
 const ownerBody=`DRAGONTAIL order request ${order.order_number}\nCustomer: ${order.email}\nTotal: ${amount}\nPayment: NOT RECEIVED\nView details in /admin/orders`;
 const ownerHtml=template({kicker:'Store operations / New request',title:'A new order request.',description:'A customer has submitted an unpaid order request. Review the details in your admin dashboard.',lines:[{label:'Order number',value:order.order_number},{label:'Customer email',value:order.email},{label:'Order total',value:amount},{label:'Payment',value:'AWAITING PAYMENT'}],button:linkButton('VIEW ORDER STUDIO','/admin/orders'),footnote:'This is not a paid sale. Do not dispatch until payment is verified.'});
 if(process.env.ORDERS_NOTIFY_EMAIL){try{await emailOrder(process.env.ORDERS_NOTIFY_EMAIL,`DRAGONTAIL | New order request ${order.order_number}`,ownerBody,ownerHtml)}catch(e){console.error('Merchant notification failed',e)}}
 const customerBody=`DRAGONTAIL\nWe received your order request ${order.order_number}.\nOrder total: ${amount}.\nPayment has NOT been collected. We will confirm your order when payment is available and verified.`;
 const customerHtml=template({kicker:'Your order / Request received',title:'Your edit is on its way to us.',description:'Thank you for choosing DRAGONTAIL. We have received your order request. Payment has not been collected, so this is not yet a confirmed purchase.',lines:[{label:'Order reference',value:order.order_number},{label:'Order total',value:amount},{label:'Payment status',value:'NOT PAID'}],button:linkButton('VIEW MY ORDERS','/account/orders'),footnote:'Please do not send money by replying to this email. We will provide a secure checkout when payments are enabled.'});
 try{await emailOrder(order.email,`DRAGONTAIL | Request received ${order.order_number}`,customerBody,customerHtml)}catch(e){console.error('Customer email failed',e)}
}
export function shippingEmailText(order:{order_number:string;status:string;carrier?:string;tracking_number?:string}) {
 const messages:Record<string,string>={processing:'We are preparing your order.',shipped:'Your order has been dispatched.',delivered:'Your order was marked delivered.',cancelled:'Your unpaid order request has been cancelled.'};
 return `DRAGONTAIL\n\n${messages[order.status]||'Your order was updated.'}\nOrder: ${order.order_number}\nStatus: ${order.status}\n${order.carrier?'Courier: '+order.carrier+'\n':''}${order.tracking_number?'Tracking number: '+order.tracking_number+'\n':''}\nThank you for choosing DRAGONTAIL.`;
}
export function shippingEmailHtml(order:{order_number:string;status:string;carrier?:string;tracking_number?:string}) {
 const titles:Record<string,string>={processing:'Carefully in preparation.',shipped:'Your order is on its way.',delivered:'Delivered. Made yours.',cancelled:'Order request cancelled.'};
 const descriptions:Record<string,string>={processing:'We are preparing your paid order for dispatch.',shipped:'Your order has been dispatched. Keep your tracking number handy.',delivered:'Your order has been marked delivered. Thank you for shopping DRAGONTAIL.',cancelled:'Your unpaid order request has been cancelled. No payment was collected.'};
 const lines=[{label:'Order reference',value:order.order_number},{label:'Order status',value:order.status.toUpperCase()}];
 if(order.carrier)lines.push({label:'Courier',value:order.carrier});
 if(order.tracking_number)lines.push({label:'Tracking number',value:order.tracking_number});
 return template({kicker:'Order update',title:titles[order.status]||'An update on your order.',description:descriptions[order.status]||'Your order status has changed.',lines,button:linkButton('VIEW MY ORDERS','/account/orders')});
}
