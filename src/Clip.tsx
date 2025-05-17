// Origin Effect from https://codepen.io/creativeocean/pen/ByBogvj
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";
import { useEffect, useRef, useCallback } from "react";


export const useGsapTimeline = <T extends HTMLElement>(
  gsapTimelineFactory: () => gsap.core.Timeline,
) => { 
  const animationScopeRef = useRef<T>(null);
  const timelineRef = useRef<gsap.core.Timeline>();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    const ctx = gsap.context(() => {
      timelineRef.current = gsapTimelineFactory();
      timelineRef.current.pause();
    }, animationScopeRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return animationScopeRef;
};



const DiceStackAnimation = () => {
  const n = 19;
  const trayRef = useRef<HTMLDivElement>(null);
  const povRefLocal = useRef<HTMLDivElement>(null);
  const dieRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (dieRefs.current.length !== n) {
    dieRefs.current = Array(n).fill(null);
  }

  const rots = [
    { ry: 90, a: 0.4 }, 
    { ry: 270, a: 0.5 }, 
    { ry: 0, a: 0.85 }, 
  ];

  useEffect(() => {
    dieRefs.current.forEach((dieEl) => {
      if (dieEl) {
        const faces = dieEl.querySelectorAll(".dice-animation-face");
        if (faces.length === 3) {
          // Ensure we have 3 faces as expected for rots mapping
          gsap.set(faces, {
            z: 200,
            rotateY: (index) => rots[index].ry, // Simplified: index is 0, 1, or 2
            transformOrigin: "50% 50% -201px",
          });
        }
      }
    });
  }, [n]); // rots is stable

  const animationTimelineRef = useGsapTimeline<HTMLDivElement>(() => {
    const masterTimeline = gsap.timeline();

    if (trayRef.current && dieRefs.current.every((ref) => ref)) {
      dieRefs.current.forEach((dieEl, i) => {
        if (dieEl) {
          const cube = dieEl.querySelector(".dice-animation-cube");
          const faces = dieEl.querySelectorAll(".dice-animation-face");

          if (cube && faces.length === 3) {
            const tl = gsap.timeline({
              repeat: -1,
              yoyo: true,
              defaults: { ease: "power3.inOut", duration: 1 },
            });

            tl.fromTo(cube, { rotateY: -90 }, { rotateY: 90, ease: "power1.inOut", duration: 2 })
              .fromTo(
                faces,
                {
                  color: (j) =>
                    `hsl(${(i / n) * 75 + 130}, 67%, ${100 * [rots[2].a, rots[0].a, rots[1].a][j]}%)`,
                },
                {
                  color: (j) =>
                    `hsl(${(i / n) * 75 + 130}, 67%, ${100 * [rots[0].a, rots[1].a, rots[2].a][j]}%)`,
                },
                0,
              )
              .to(
                faces,
                {
                  color: (j) =>
                    `hsl(${(i / n) * 75 + 130}, 67%, ${100 * [rots[1].a, rots[2].a, rots[0].a][j]}%)`,
                },
                1,
              );

            // Add to master timeline with a stagger based on index
            masterTimeline.add(tl, i * 0.05); 

            const progressVal = i / n;
            tl.progress(progressVal); // Then set the progress of the child timeline
          }
        }
      });

      const trayTl = gsap.timeline();
      trayTl
        .from(
          trayRef.current,
          { yPercent: -3, duration: 2, ease: "power1.inOut", yoyo: true, repeat: -1 },
          0,
        )
        .fromTo(
          trayRef.current,
          { rotate: -15 },
          { rotate: 15, duration: 4, ease: "power1.inOut", yoyo: true, repeat: -1 },
          0,
        )
        .from(
          dieRefs.current.filter((el) => el) as gsap.DOMTarget[],
          { duration: 0.01, opacity: 0, stagger: { each: -0.05, ease: "power1.in" } },
          0,
        )
        .to(
          trayRef.current,
          { scale: 1.2, duration: 2, ease: "power3.inOut", yoyo: true, repeat: -1 },
          0,
        );

      masterTimeline.add(trayTl, 0);
    }

    return masterTimeline;
  });

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      // animationTimelineRef is a RefObject from useGsapTimeline
      if (animationTimelineRef) {
        (animationTimelineRef as React.RefObject<HTMLDivElement | null>).current = node;
      }
      povRefLocal.current = node;
    },
    [animationTimelineRef],
  );

  return (
    <>
      <AbsoluteFill
        ref={combinedRef}
        className="dice-animation-container w-full h-full flex items-center justify-center font-black bg-black overflow-hidden"
      >
        <div className="dice-animation-tray relative" ref={trayRef}>
          {[...Array(n)].map((_, i) => (
            <div
              key={i}
              className="dice-animation-die w-[400px] h-[55px] pb-[9px] [perspective:999px]"
              ref={(el) => {
                dieRefs.current[i] = el;
              }}
            >
              <div className="dice-animation-cube absolute w-full h-full [transform-style:preserve-3d]">
                <div className="dice-animation-face absolute w-full h-full flex items-center justify-center backface-hidden text-[48px]">
                  代码11
                </div>
                <div className="dice-animation-face absolute w-full h-full flex items-center justify-center backface-hidden text-[55px]">
                  DRIVEN
                </div>
                <div className="dice-animation-face absolute w-full h-full flex items-center justify-center backface-hidden text-[55px]">
                  ANIMATION
                </div>
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </>
  );
};

export default DiceStackAnimation;
