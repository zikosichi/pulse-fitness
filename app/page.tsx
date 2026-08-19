"use client";

import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Proof from "@/components/Proof";
import About from "@/components/About";
import Venue from "@/components/Venue";
import Trainers from "@/components/Trainers";
import Offer from "@/components/Offer";
import Classes from "@/components/Classes";
import Divider from "@/components/Divider";
import Membership from "@/components/Membership";
import Ribbons from "@/components/Ribbons";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useLang } from "@/components/LangProvider";
import { ui } from "@/lib/content";

/* Section order follows the Paper artboard "Pulse Fitness — Dark / Gloss".
   Contact facts land in the first screen, so the business-card job is done
   before any scroll; the room proves itself early because a brand-new gym
   has to; trainers sit before pricing so the price lands right after the
   strongest human argument. */
export default function Page() {
  const { t } = useLang();

  return (
    <>
      <a className="skip" href="#main">
        {t(ui.skip)}
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <Proof />
        <About />
        <Venue />
        <Trainers />
        <Offer />
        <Classes />
        <Divider />
        <Membership />
        <Ribbons />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
