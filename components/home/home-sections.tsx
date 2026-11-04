import { Hero } from "./hero";
import { Features } from "./features";
import { EditorsNote } from "./note";
import { WeatherCalendar } from "./weather-calendar";
import { Areas } from "./areas";
import { HelpLines } from "./help-lines";
import { ToolsShowcase } from "./tools-showcase";
import { Checklist } from "./checklist";
import { Themes } from "./themes";
import { Policy } from "./policy";
import type { HomeContent } from "@/lib/cms/pages";

/** The home page body, shared by the public page and the page-builder canvas (which passes unsaved content). */
export function HomeSections({ c }: { c: HomeContent }) {
  return (
    <>
      <Hero c={c.hero} />
      <Features items={c.features} />
      <EditorsNote c={c.note} />
      <WeatherCalendar c={c.calendar} />
      <Areas c={c.areas} />
      <HelpLines c={c.help} />
      <ToolsShowcase c={c.tools} />
      <Checklist c={c.checklist} />
      <Themes c={c.themes} />
      <Policy c={c.policy} />
    </>
  );
}
