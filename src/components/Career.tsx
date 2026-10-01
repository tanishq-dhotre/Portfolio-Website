import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          Education <span>&</span>
          <br /> leadership
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech, AI & Data Science</h4>
                <h5>NIAT, Sanjay Ghodawat University | Kolhapur</h5>
              </div>
              <h3>8.5+</h3>
            </div>
            <p>
              2025 - 2029. Currently in my second year, building skills in
              programming, web development, databases, data structures, and AI.
              I also lead technical initiatives, support student participation
              in coding events, and collaborate to promote technical learning.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Class XII | CBSE</h4>
                <h5>Suyash Central School | Solapur</h5>
              </div>
              <h3>84%</h3>
            </div>
            <p>
              Completed in 2025 after studying from 2023 to 2025.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Class X | ICSE</h4>
                <h5>Saint Thomas English Medium School | Solapur</h5>
              </div>
              <h3>94%</h3>
            </div>
            <p>
              Completed in 2023.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
