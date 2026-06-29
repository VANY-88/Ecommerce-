import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const teamMembers = [
  {
    id: 2,
    name: "Nguyen Van Huy",
    role: "Fullstack Developer",
    description:
      "Huy builds the platform end-to-end — from the ASP.NET Core API and database design to the pixel-perfect, responsive React interface on top of it.",
    imageUrl: "./assets/huy-avatar.webp",
    skills: ["React", "TypeScript", "ASP.NET Core", "C#", "SQL Server", "Tailwind CSS"],
  },
];

const values = [
  {
    icon: (
      <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    title: "Customer First",
    desc: "Every feature we build starts by asking what creates the best experience for our shoppers.",
  },
  {
    icon: (
      <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Quality Craft",
    desc: "We sweat the details so our users never have to. Great products are built with care.",
  },
  {
    icon: (
      <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Always Improving",
    desc: "We move fast, listen to feedback, and continuously ship better experiences.",
  },
];

const stats = [
  { value: "500+", label: "Products" },
  { value: "10K+", label: "Customers" },
  { value: "1", label: "Founders" },
  { value: "99%", label: "Satisfaction" },
];

function About() {
  return (
    <div className="min-vh-100 bg-brown-500 font-dm-sans">

      {/* Hero */}
      <section
        className="position-relative overflow-hidden bg-brown text-center px-4"
        style={{ paddingBottom: "7rem" }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(circle at 20% 60%, #FF7029 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D74800 0%, transparent 45%)",
          }}
        />
        <div className="position-relative mx-auto d-flex flex-column gap-4" style={{ maxWidth: "768px" }}>
          <span
            className="d-inline-block text-orange-400 fw-semibold text-uppercase rounded-pill px-4 py-2"
            style={{
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              border: "1px solid rgba(215, 72, 0, 0.4)",
            }}
          >
            About Us
          </span>
          <h1 className="fs-display-2 fw-bold text-white" style={{ lineHeight: 1.1 }}>
            Built by one,<br />
            <span className="text-orange-400">loved by thousands</span>
          </h1>
          <p className="text-brown-700 fs-3" style={{ lineHeight: 1.6 }}>
            WEB-SHOP started as a passion project — one developer who believed
            online shopping could be simpler, faster, and actually enjoyable.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-top border-bottom border-brown-600">
        <Container className="py-5" style={{ maxWidth: "896px" }}>
          <Row className="text-center g-0">
            {stats.map((stat, index) => (
              <Col
                key={stat.label}
                xs={6}
                md={3}
                className="py-4"
                style={{
                  borderLeft: index !== 0 ? "1px solid #e3ded2" : undefined,
                }}
              >
                <p className="fs-display-3 fw-bold text-orange-500 mb-0">{stat.value}</p>
                <p className="text-brown-1000 mt-1 mb-0">{stat.label}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Mission */}
      <Container className="px-4 py-5" style={{ maxWidth: "1024px", paddingTop: "6rem", paddingBottom: "6rem" }}>
        <Row className="align-items-center g-5">
          <Col md={6} className="d-flex flex-column gap-3">
            <h2 className="fs-display-3 fw-bold text-heading-black">
              Why we built<br />
              <span className="text-orange-500">this shop</span>
            </h2>
            <p className="text-brown-1000 fs-dm-base">
              We were tired of online stores that were slow, cluttered, and hard to trust.
              So we built WEB-SHOP — a store we'd actually want to use ourselves.
            </p>
            <p className="text-brown-1000 fs-dm-base">
              From the first commit to the latest deploy, every decision has been made
              with one goal: make shopping simpler and more human.
            </p>
          </Col>
          <Col md={6}>
            <div className="d-flex flex-column gap-3">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="d-flex gap-3 bg-white rounded-4 p-4 border border-brown-600 shadow-custom"
                >
                  <div
                    className="flex-shrink-0 bg-orange-500 rounded-3 d-flex align-items-center justify-content-center text-orange-500"
                    style={{ width: "2.75rem", height: "2.75rem", backgroundColor: "rgba(215, 72, 0, 0.1)" }}
                  >
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="fw-semibold text-heading-black">{v.title}</h3>
                    <p className="text-brown-1000 small mt-1">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Team */}
      <section className="bg-white px-4" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <Container style={{ maxWidth: "896px" }}>
          <div className="d-flex flex-column gap-3 text-center mb-5">
            <h2 className="fs-display-3 fw-bold text-heading-black">
              Meet the <span className="text-orange-500">founder</span>
            </h2>
            <p className="text-brown-1000 fs-dm-base">
              One person, one shared vision — build something people love.
            </p>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="d-flex flex-column align-items-center text-center bg-brown-400 rounded-4 p-5 border border-brown-600 w-100"
                style={{ maxWidth: "384px" }}
              >
                <div className="position-relative mb-4">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="rounded-4"
                    style={{ width: "112px", height: "112px", objectFit: "cover" }}
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    className="position-absolute rounded-circle border border-2 border-white"
                    style={{
                      bottom: "-0.5rem",
                      right: "-0.5rem",
                      width: "1.25rem",
                      height: "1.25rem",
                      backgroundColor: "#4ade80",
                    }}
                  />
                </div>
                <h3 className="fs-display-4 fw-bold text-heading-black">{member.name}</h3>
                <p className="text-orange-500 fw-medium small mt-1">{member.role}</p>
                <p className="text-brown-1000 small mt-3">{member.description}</p>
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-white text-heading-black fw-medium rounded-pill border border-brown-600 px-3 py-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="px-4 text-center d-flex flex-column gap-4" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <h2 className="fs-display-3 fw-bold text-heading-black mb-0">
          Ready to explore?
        </h2>
        <p className="text-brown-1000 fs-dm-base mx-auto mb-0" style={{ maxWidth: "384px" }}>
          Browse hundreds of products curated for quality and value.
        </p>
        <a
          href="/"
          className="d-inline-block bg-orange-500 text-white fw-semibold rounded-4 px-5 py-3 fs-5 text-decoration-none mx-auto"
        >
          Start Shopping
        </a>
      </section>
    </div>
  );
}

export default About;
