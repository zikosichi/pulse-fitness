"use client";
import Shell from "./Shell";
import { useLang } from "../LangProvider";
import styles from "./presale.module.css";
export default function Policy({ privacy = false }: { privacy?: boolean }) {
  const { t, lang } = useLang();
  return (
    <Shell>
      <article className={styles.policy}>
        <h1>
          {privacy
            ? t({ ka: "კონფიდენციალურობის ინფორმაცია", en: "Privacy notice" })
            : t({
                ka: "წინასწარი შეძენის პირობები",
                en: "Presale purchase terms",
              })}
        </h1>
        <p>
          {t({
            ka: "მომსახურების მიმწოდებელია შპს პულს წყალტუბო (ს/კ 405837359), წერეთლის ქუჩა 12, წყალტუბო. საკონტაქტო ინფორმაცია: info@pulsefitness.ge · +995 598 29 43 73.",
            en: "The service provider is Puls Tskaltubo LLC (ID 405837359), 12 Tsereteli Street, Tskaltubo. Contact: info@pulsefitness.ge · +995 598 29 43 73.",
          })}
        </p>
        {privacy ? (
          <>
            <h2>
              {t({ ka: "რა ინფორმაციას ვინახავთ", en: "Information we store" })}
            </h2>
            <p>
              {t({
                ka: "წინასწარი შეძენისას ვინახავთ სახელს, გვარს, ტელეფონს, ელფოსტას, არჩეულ აბონემენტს, ფასს, შეკვეთისა და გადახდის სტატუსს, ბანკის შეკვეთის ნომერს და პირობებზე თანხმობის თარიღსა და ვერსიას.",
                en: "When you purchase a membership, we store your name, phone number, email, selected membership, price, order and payment status, bank order reference, and the date and version of the terms you accepted.",
              })}
            </p>
            <h2>
              {t({ ka: "რისთვის ვიყენებთ მონაცემებს", en: "How we use it" })}
            </h2>
            <p>
              {t({
                ka: "მონაცემები გამოიყენება შეკვეთის დასამუშავებლად, გადახდის გადასამოწმებლად, შენთვის ელფოსტით დადასტურების გამოსაგზავნად, უფლებამოსილი თანამშრომლებისთვის რეგისტრაციის შესატყობინებლად, აბონემენტის გასააქტიურებლად და შეკვეთასთან დაკავშირებული საკითხების მოსაგვარებლად. ფორმის შევსება სარეკლამო შეტყობინებებზე თანხმობას არ ნიშნავს.",
                en: "We use these details to process your order, verify payment, email your confirmation, notify authorized staff of your registration, activate your membership and resolve order-related questions. Completing this form does not subscribe you to marketing messages.",
              })}
            </p>
            <h2>
              {t({ ka: "გადახდა და შენახვა", en: "Payment and storage" })}
            </h2>
            <p>
              {t({
                ka: "საბანკო ბარათის მონაცემებს შეიყვან საქართველოს ბანკის გადახდის გვერდზე. Pulse-ის ფორმა ბარათის ნომერსა და უსაფრთხოების კოდს არ აგროვებს. ვებსაიტის ჰოსტინგის, მონაცემთა ბაზისა და ელფოსტის გაგზავნის მომწოდებლები ამუშავებენ სერვისის მუშაობისთვის საჭირო მონაცემებს. ვინახავთ შეკვეთასთან დაკავშირებულ ელფოსტის ტექსტსა და გაგზავნის სტატუსს. წევრების სია ხელმისაწვდომია მხოლოდ უფლებამოსილი თანამშრომლებისთვის.",
                en: "You enter your card details on Bank of Georgia’s payment page. The Pulse form does not collect card numbers or security codes. Website hosting, database and email delivery providers process the data needed to operate the service. We store order email content and sending status. The member list is restricted to authorized staff.",
              })}
            </p>
            <h2>
              {t({
                ka: "ბრაუზერის სესია და შეკითხვები",
                en: "Browser session and questions",
              })}
            </h2>
            <p>
              {t({
                ka: "აუცილებელი ქუქი იმავე ბრაუზერში შენი შეკვეთის სტატუსის ნახვის საშუალებას გაძლევს და 30 დღეში იწურება. შენს მონაცემებთან დაკავშირებული შეკითხვებისთვის ან შესწორებისთვის მოგვწერე info@pulsefitness.ge-ზე.",
                en: "An essential cookie lets you view your order status in the same browser and expires after 30 days. For questions about your data or to request a correction, contact info@pulsefitness.ge.",
              })}
            </p>
          </>
        ) : (
          <>
            <h2>{t({ ka: "რას ყიდულობ", en: "What you are buying" })}</h2>
            <p>
              {t({
                ka: "წინასწარ ყიდულობ ფორმაში არჩეულ სავარჯიშო დარბაზის აბონემენტს. მოქმედების ვადა იწყება დარბაზის გახსნის შემდეგ, შენი პირველი ვიზიტიდან. ჯგუფური და პირადი ვარჯიშები ფასში არ შედის.",
                en: "You are prepaying for the gym membership selected in the form. Its validity begins on your first visit after the gym opens. Group classes and personal training are not included.",
              })}
            </p>
            <h2>{t({ ka: "ფასი და შეთავაზება", en: "Price and offer" })}</h2>
            <p>
              {t({
                ka: "ულიმიტო აბონემენტის პირველი თვე ღირს 96 ₾, ნაცვლად 120 ₾-ისა (20% ფასდაკლება). შეთავაზება მოქმედებს 2026 წლის 4 ოქტომბრის 23:59-მდე, თბილისის დროით, ერთხელ თითო წევრზე, მხოლოდ პირველ თვეზე. 5 ოქტომბრიდან ახალი შეკვეთის ფასი არის 120 ₾. სხვა აბონემენტებსა და შემდგომ თვეებზე მოქმედებს სტანდარტული ფასი. ყველა ფასი მოცემულია ქართულ ლარში (GEL).",
                en: "The first unlimited month costs ₾96 instead of ₾120 (20% off). The offer is available through 4 October 2026 at 23:59 Tbilisi time, once per member and only for their first month. New orders cost ₾120 from 5 October. Other memberships and later months are sold at regular prices. All prices are in Georgian lari (GEL).",
              })}
            </p>
            <p>
              {t({
                ka: "შესასვლელი ბარათის 10 ₾ ან სამაჯურის 20 ₾ საფასურს გადაიხდი ადგილზე. ეს თანხა ონლაინ გადახდაში არ შედის. სტუდენტის ან მოსწავლის აბონემენტისთვის პირველ ვიზიტზე საჭიროა შესაბამისი სტატუსის დადასტურება.",
                en: "An access card costs ₾10 or a wristband costs ₾20, payable at reception and excluded from the online payment. Student and school-pupil memberships require proof of eligibility on the first visit.",
              })}
            </p>
            <h2>
              {t({
                ka: "გადახდა და დადასტურება",
                en: "Payment and confirmation",
              })}
            </h2>
            <p>
              {t({
                ka: "ეს არის ერთჯერადი გადახდა საქართველოს ბანკის გვერდზე, ავტომატური განახლების გარეშე. შეკვეთა დადასტურებულია მხოლოდ გადახდის წარმატების გადამოწმების შემდეგ. შეინახე დადასტურების გვერდზე მითითებული შეკვეთის ნომერი და პირველ ვიზიტზე აჩვენე ადმინისტრატორს.",
                en: "This is a one-time payment through Bank of Georgia, with no automatic renewal. Your order is confirmed only after successful payment is verified. Keep the reference on your confirmation page and present it at reception on your first visit.",
              })}
            </p>
            <h2>{t({ ka: "დახმარება", en: "Help with your order" })}</h2>
            <p>
              {t({
                ka: "თუ გადახდის სტატუსი გაურკვეველია, მონაცემების შესწორება გჭირდება ან გახსნის თარიღის შესახებ გაქვს კითხვა, დაგვიკავშირდი შეკვეთის ნომრით, ახალი გადახდის დაწყებამდე.",
                en: "If your payment status is unclear, you need to correct your details, or you have questions about the opening date, contact us with your order reference before making another payment.",
              })}
            </p>
          </>
        )}
        <p style={{ marginTop: 32 }}>
          <a href={`/presale?lang=${lang}`}>
            {t({
              ka: "← წინასწარ შეძენაზე დაბრუნება",
              en: "← Back to presale",
            })}
          </a>
        </p>
      </article>
    </Shell>
  );
}
