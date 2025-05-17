import "./index.css";
import { Composition } from "remotion";
import DiceStackAnimation from "./Clip";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DiceStackAnimation"
        component={DiceStackAnimation}
        durationInFrames={60 * 6}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
