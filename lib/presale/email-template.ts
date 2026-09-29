import { money, testPaymentPackage } from "./catalog";

export type EmailOrder = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  package_name: string;
  package_id?: string;
  amount: number;
  regular_amount: number;
  lang: "ka" | "en";
  paid_at: Date | string;
};
export type EmailKind = "customer" | "staff";
const escape = (value: string) => value.replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
);

export function paymentEmail(order: EmailOrder, kind: EmailKind) {
  const ka = kind === "staff" || order.lang === "ka";
  const isTest = order.package_id === testPaymentPackage.id;
  const title = isTest
    ? ka ? "სატესტო გადახდა დადასტურებულია" : "Test payment confirmed"
    : kind === "staff"
    ? "ახალი გადახდილი რეგისტრაცია"
    : ka ? "შენი გადახდა დადასტურებულია" : "Your payment is confirmed";
  const greeting = isTest
    ? ka ? "საქართველოს ბანკმა დაადასტურა რეალური 2 ₾-ის სატესტო გადახდა. აბონემენტი არ გააქტიურებულა."
      : "Bank of Georgia confirmed a real 2 GEL test payment. No membership has been activated."
    : kind === "staff"
    ? "საქართველოს ბანკმა დაადასტურა ახალი აბონემენტის გადახდა."
    : ka ? `გამარჯობა, ${order.first_name}! მადლობა, რომ ირჩევ Pulse Fitness-ს.`
      : `Hi ${order.first_name}! Thank you for choosing Pulse Fitness.`;
  const date = new Intl.DateTimeFormat(ka ? "ka-GE" : "en-GB", {
    timeZone: "Asia/Tbilisi", dateStyle: "medium", timeStyle: "short",
  }).format(new Date(order.paid_at));
  const details: [string, string][] = [
    [ka ? "შეკვეთის ნომერი" : "Order reference", order.id],
    [ka ? "წევრი" : "Member", `${order.first_name} ${order.last_name}`],
    [ka ? "აბონემენტი" : "Membership", order.package_name],
    [ka ? "გადახდილი თანხა" : "Amount paid", `${money(order.amount)} ₾`],
    [ka ? "გადახდის დრო (თბილისი)" : "Payment time (Tbilisi)", date],
  ];
  if (order.regular_amount > order.amount) {
    details.push([ka ? "პირველი თვის ფასდაკლება" : "First-month saving", `${money(order.regular_amount - order.amount)} ₾ (20%)`]);
  }
  if (kind === "staff") details.push(
    ["ტელეფონი", order.phone], ["ელფოსტა", order.email],
  );
  const notes = isTest ? [
    testPaymentPackage.note![ka ? "ka" : "en"],
    ka ? "შეინახე შეკვეთის ნომერი სატესტო გადახდის გადასამოწმებლად." : "Keep your reference to verify the test payment.",
    "info@pulsefitness.ge · +995 598 29 43 73",
  ] : ka ? [
    "აბონემენტის მოქმედების ვადა დაიწყება პირველი ვიზიტიდან, დარბაზის გახსნის შემდეგ.",
    "შესასვლელი ბარათი 10 ₾ ან სამაჯური 20 ₾ — საფასური გადაიხდება ადგილზე და ამ გადახდაში არ შედის.",
    "ეს არის ერთჯერადი გადახდა, ავტომატური განახლების გარეშე.",
    "შეინახე შეკვეთის ნომერი და პირველ ვიზიტზე აჩვენე ადმინისტრატორს.",
    "შეკითხვებისთვის: info@pulsefitness.ge · +995 598 29 43 73",
  ] : [
    "Your membership starts on your first visit after the gym opens.",
    "An access card costs ₾10 or a wristband ₾20, paid at reception and excluded from this payment.",
    "This is a one-time payment with no automatic renewal.",
    "Keep your order reference and show it at reception on your first visit.",
    "Questions: info@pulsefitness.ge · +995 598 29 43 73",
  ];
  return {
    subject: `Pulse Fitness — ${title} · ${order.id}`,
    text: [title, greeting, ...details.map(([k, v]) => `${k}: ${v}`), ...notes].join("\n\n"),
    // Inline colors and table spacing survive email clients that strip page CSS.
    // Use the existing PNG logo: SVG and web fonts are not reliable in inboxes.
    html: `<!doctype html>
<html lang="${ka ? "ka" : "en"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escape(title)}</title>
<style>
@media only screen and (max-width:620px){.outer{padding:40px 12px!important}.content{padding-left:24px!important;padding-right:24px!important}.headline{font-size:28px!important}.detail-label,.detail-value{display:block!important;width:auto!important;text-align:left!important}.detail-label{padding-bottom:4px!important;border-bottom:0!important}.detail-value{padding-top:0!important}.brand{width:200px!important;height:auto!important}}
</style></head>
<body style="margin:0;padding:0;width:100%;background-color:#08120E;color:#FFFFFF;font-family:Inter,'Noto Sans Georgian',Arial,sans-serif;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escape(title)} · ${escape(order.package_name)} · ${money(order.amount)} ₾</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#08120E" style="width:100%;background-color:#08120E"><tr><td class="outer" align="center" style="padding:64px 16px 72px">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
<tr><td align="center" style="padding:8px 24px 40px"><a href="https://www.pulsefitness.ge" style="text-decoration:none"><img class="brand" src="https://www.pulsefitness.ge/brand/logo.png" width="232" height="87" alt="Pulse Fitness" style="display:block;width:232px;max-width:100%;height:auto;border:0;color:#FFFFFF;font-size:24px"></a></td></tr>
<tr><td bgcolor="#0C1813" style="background-color:#0C1813;border:1px solid #304138;border-radius:24px;overflow:hidden">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td class="content" style="padding:40px 36px 0"><span style="display:inline-block;border:1px solid #3DC26C;border-radius:20px;padding:8px 14px;color:#3DC26C;font-size:12px;line-height:18px;font-weight:bold;letter-spacing:1px">${ka ? "გადახდა დადასტურებულია" : "PAYMENT CONFIRMED"}</span></td></tr>
<tr><td class="content" style="padding:24px 36px 0"><h1 class="headline" style="margin:0;color:#FFFFFF;font-size:32px;line-height:1.45;font-weight:800">${escape(title)}</h1></td></tr>
<tr><td class="content" style="padding:20px 36px 32px;color:#B4C0BA;font-size:16px;line-height:1.85">${escape(greeting)}</td></tr>
<tr><td class="content" style="padding:0 36px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#14271D" style="background-color:#14271D;border:1px solid #304138;border-radius:18px"><tr><td style="padding:24px">
<p style="margin:0 0 12px;color:#B4C0BA;font-size:13px;line-height:1.6">${ka ? "გადახდილი თანხა" : "Amount paid"}</p>
<p style="margin:0;color:#FFFFFF;font-size:44px;line-height:1.2;font-weight:800">${money(order.amount)} <span style="font-size:26px;color:#B4C0BA">₾</span>${order.regular_amount > order.amount ? ` <del style="font-size:18px;color:#B4C0BA;font-weight:400">${money(order.regular_amount)} ₾</del>` : ""}</p>
${order.regular_amount > order.amount ? `<p style="margin:18px 0 0"><span style="display:inline-block;background-color:#3DC26C;color:#06110B;padding:8px 12px;border-radius:8px;font-size:13px;line-height:1.6;font-weight:bold">${ka ? "პირველი თვე −20%" : "FIRST MONTH −20%"}</span></p>` : ""}
</td></tr></table></td></tr>
<tr><td class="content" style="padding:0 36px 32px">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed">
${details.filter((_, i) => i !== 3).map(([k, v]) => `<tr><th class="detail-label" scope="row" width="42%" style="width:42%;text-align:left;vertical-align:top;padding:16px 12px 16px 0;border-bottom:1px solid #304138;color:#B4C0BA;font-size:13px;line-height:1.8;font-weight:400">${escape(k)}</th><td class="detail-value" style="text-align:right;vertical-align:top;padding:16px 0;border-bottom:1px solid #304138;color:#F7F5F2;font-size:14px;line-height:1.8;overflow-wrap:anywhere;word-break:break-word">${escape(v)}</td></tr>`).join("")}
</table></td></tr>
<tr><td class="content" style="padding:4px 36px 40px"><h2 style="margin:0 0 20px;color:#FFFFFF;font-size:18px;line-height:1.6">${isTest ? (ka ? "სატესტო გადახდა" : "Test payment") : (ka ? "პირველ ვიზიტამდე" : "Before your first visit")}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${notes.slice(0, -1).map(n => `<tr><td width="22" valign="top" style="padding:0 8px 16px 0;color:#3DC26C;font-size:16px;line-height:1.85">✓</td><td style="padding:0 0 16px;color:#B4C0BA;font-size:14px;line-height:1.85">${escape(n)}</td></tr>`).join("")}</table>
</td></tr></table></td></tr>
<tr><td align="center" style="padding:36px 24px 12px;color:#B4C0BA;font-size:13px;line-height:1.9"><p style="margin:0 0 12px;color:#FFFFFF;font-weight:bold">${ka ? "გაქვს შეკითხვა?" : "Have a question?"}</p><a href="mailto:info@pulsefitness.ge" style="color:#3DC26C;text-decoration:underline">info@pulsefitness.ge</a><br><a href="tel:+995598294373" style="color:#B4C0BA;text-decoration:none">+995 598 29 43 73</a><p style="margin:20px 0 0;color:#93A29B">Pulse Fitness · ${ka ? "წყალტუბო" : "Tskaltubo"}</p></td></tr>
</table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`,
  };
}
