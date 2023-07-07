import "./styles/global.css";
import styles from "./styles/Home.module.css";
import { TetrisGame } from "./modules/TetrisGame";

export default function Home() {
  return (
    <>
      <div className={styles["heading"]}>
        <h1 className={styles["heading-title"]}>Eric&rsquo;s Tetris</h1>
      </div>
      <div className={styles["content"]}>
        <TetrisGame />
      </div>
    </>
  );
}
