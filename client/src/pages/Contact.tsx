import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useReveal } from "../components/Reveal";
import { EmailIcon, UpworkIcon } from "../components/icons/ContactIcons";

const EMAIL = "ngvhuy.ityu@gmail.com";
const UPWORK_URL = "https://www.upwork.com/freelancers/~010b3233d2aaa30d80?mp_source=share";

const contactCards = [
  {
    icon: <EmailIcon className="icon-sm" />,
    title: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    cta: "Send an email",
    external: false,
  },
  {
    icon: <UpworkIcon className="icon-sm" />,
    title: "Upwork",
    value: "View freelancer profile",
    href: UPWORK_URL,
    cta: "View Upwork profile",
    external: true,
  },
];

function Contact() {
  const contentReveal = useReveal<HTMLDivElement>();

  return (
    <div className="min-vh-100 bg-brown-500 font-dm-sans">

      {/* Hero */}
      <section
        data-header-theme="dark"
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
            Contact
          </span>
          <h1 className="fs-display-2 fw-bold text-white" style={{ lineHeight: 1.1 }}>
            Let's build<br />
            <span className="text-orange-400">something together</span>
          </h1>
          <p className="text-brown-700 fs-3" style={{ lineHeight: 1.6 }}>
            Furnitech is built and maintained by one developer — Huy (VANY).
            Got a project in mind, or a question about this one? Reach out directly.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <Container
        ref={contentReveal.ref}
        className={`px-4 py-5 ${contentReveal.className}`}
        style={{ maxWidth: "896px", paddingTop: "6rem", paddingBottom: "6rem" }}
      >
        <Row className="g-4 justify-content-center">
          {contactCards.map((card) => (
            <Col key={card.title} md={6}>
              <div
                className="d-flex flex-column align-items-start gap-3 bg-white rounded-4 p-4 border border-brown-600 shadow-custom h-100 contact-card"
              >
                <div
                  className="flex-shrink-0 rounded-3 d-flex align-items-center justify-content-center text-orange-500 contact-card-icon"
                  style={{ width: "2.75rem", height: "2.75rem", backgroundColor: "rgba(215, 72, 0, 0.1)" }}
                >
                  {card.icon}
                </div>
                <div>
                  <h3 className="fw-semibold text-heading-black mb-1">{card.title}</h3>
                  <p className="text-brown-1000 small mb-0">{card.value}</p>
                </div>
                <a
                  href={card.href}
                  target={card.external ? "_blank" : undefined}
                  rel={card.external ? "noopener noreferrer" : undefined}
                  aria-label={card.external ? `${card.cta} (opens in a new tab)` : card.cta}
                  className="d-inline-block bg-orange-500 text-white fw-semibold rounded-4 px-4 py-2 text-decoration-none mt-2"
                >
                  {card.cta}
                </a>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default Contact;
