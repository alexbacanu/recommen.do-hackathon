import { Dashboard } from "~/components/layout/dashboard";
import { Init } from "~/components/layout/init";

import "~/styles/globals.css";

export default function IndexPopup() {
  return (
    <section id="popup_page">
      <Init />
      <Dashboard />
    </section>
  );
}
