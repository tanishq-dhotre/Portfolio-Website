import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const assetBase = import.meta.env.BASE_URL;

const projects = [
  {
    title: "BlinkGuard",
    category: "AI Drowsiness Detection",
    image: `${assetBase}images/work-blinkguard.webp`,
    imageLabel: "Driver monitoring",
    description:
      "A real-time driver monitoring system that analyzes facial cues and eye blinks, then triggers alerts to support safer driving.",
    technologies: "Python, OpenCV, MediaPipe, NumPy, C++, Arduino IDE",
  },
  {
    title: "OpenTruth",
    category: "Student Decision Platform",
    image: `${assetBase}images/work-opentruth.webp`,
    imageLabel: "Student perspectives",
    description:
      "A student-focused platform for sharing authentic experiences and feedback to help students make informed academic decisions.",
    technologies: "HTML, CSS, JavaScript, Node.js, Express.js, MongoDB",
  },
  {
    title: "AI Drowsiness Detector",
    category: "Computer Vision",
    image: `${assetBase}images/work-computer-vision.webp`,
    imageLabel: "Face and eye analysis",
    description:
      "An AI-based drowsiness detection project using visual input and image-processing techniques to identify signs of fatigue.",
    technologies: "Python, OpenCV",
  },
];

const Work = () => {
  useGSAP(() => {
    let translateX = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      const padding = parseInt(window.getComputedStyle(box[0]).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`,
        scrub: true,
        pin: true,
        id: "work",
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => (
            <div className="work-box" key={project.title}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{String(index + 1).padStart(2, "0")}</h3>

                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <p>{project.description}</p>
                <h4>Technologies</h4>
                <p>{project.technologies}</p>
              </div>
              <WorkImage
                image={project.image}
                alt={`${project.title}: ${project.imageLabel}`}
                label={project.imageLabel}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
