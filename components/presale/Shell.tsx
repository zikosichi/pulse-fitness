"use client";
import Nav from "../Nav";
import { useLang } from "../LangProvider";
import { config } from "@/lib/config";
import styles from "./presale.module.css";
export default function Shell({ children }: { children: React.ReactNode }) {
  const { lang, t } = useLang();
  return (
    <div className={styles.page}>
      <Nav innerPage className={styles.navigation} />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div>
          <strong>Pulse Fitness</strong>
          <p>
            {t({
              ka: "შპს პულს წყალტუბო · ს/კ 405837359",
              en: "Puls Tskaltubo LLC · ID 405837359",
            })}
          </p>
          <p>
            {t({ ka: config.address.ka || "", en: config.address.en || "" })}
          </p>
        </div>
        <div>
          <a href={`tel:${config.phone}`}>{config.phoneDisplay}</a>
          <a href={`mailto:${config.email}`}>{config.email}</a>
        </div>
        <nav aria-label={t({ ka: "პირობები", en: "Policies" })}>
          <a href={`/presale/terms?lang=${lang}`}>
            {t({ ka: "შეძენის პირობები", en: "Purchase terms" })}
          </a>
          <a href={`/presale/privacy?lang=${lang}`}>
            {t({ ka: "კონფიდენციალურობა", en: "Privacy" })}
          </a>
        </nav>
      </footer>
    </div>
  );
}
