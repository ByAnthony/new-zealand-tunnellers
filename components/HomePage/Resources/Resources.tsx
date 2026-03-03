import STYLES from "./Resources.module.scss";

export function Resources() {
  return (
    <div id="resources" className={STYLES["resources"]}>
      <h2>Resources to Explore</h2>
      <div className={STYLES["resources-links"]}>
        <div className={STYLES["resource"]}>
          <label>Book</label>
          <h3>Kiwis Dig Tunnels Too</h3>
          <h4>By Anthony Byledbal</h4>
          <p>
            Recruited for their digging skills, James Williamson, Harold Howard,
            George Race, and Gerald Punch—four New Zealand volunteer
            recruits—are preparing to cross the oceans with their special unit
            to take part in this secret war. But on the other side of the world,
            this deadly game is already tipping in favor of the German miners.
          </p>
        </div>
      </div>
    </div>
  );
}
