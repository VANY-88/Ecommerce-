import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import api from "../services/api";
import { ApiResponse, Product } from "../types/api";

function LandingPage() {
  const [activeTab, setActiveTab] = useState("Furniture");
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<ApiResponse<Product[]>>("/products");
        setProducts(response.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: number) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      await api.post("/carts/add-item", { userId, productId });
      toast.success("Product added to cart successfully!");
    } catch (error) {
      toast.error("Error adding product to cart.");
      console.error("Error adding product to cart:", error);
    }
  };

  return (
    <>
      <section className="w-100 h-auto bg-brown-400" style={{ backgroundPosition: "center" }}>
        {/* Hero Section */}
        <section
          className="position-relative w-100 d-flex align-items-center"
          style={{
            backgroundImage: `url('./assets/Container.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100vh",
          }}
        >
          {/* Hero card */}
          <section
            className="d-flex flex-column justify-content-center align-items-start font-dm-sans gap-4 gap-lg-5"
            style={{
              width: "calc(100% - 2rem)",
              maxWidth: "868px",
              padding: "1.5rem",
              marginLeft: "max(5vw, calc(50vw - 434px))",
              marginRight: "2rem",
              borderRadius: "40px",
              border: "1px solid rgba(255,255,255,0.30)",
              background:
                "linear-gradient(to right, rgba(255,255,255,0.10), rgba(255,255,255,0.30), rgba(255,255,255,0.60))",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <div className="d-flex flex-column align-items-start gap-3 w-100">
              <div className="d-flex flex-column align-items-start gap-3">
                <h1 className="fs-display-2 font-dm-sans fw-bold text-orange-500 mb-0" style={{ fontSize: "clamp(2.25rem, 6vw, 68px)" }}>
                  Perfect Pieces{" "}
                  <span className="text-heading-black font-dm-sans fw-bold" style={{ fontSize: "clamp(2.25rem, 6vw, 68px)", lineHeight: 1.1 }}>
                    for
                  </span>
                  <span className="d-flex text-heading-black font-dm-sans fw-bold" style={{ fontSize: "clamp(2.25rem, 6vw, 68px)", lineHeight: 1.1 }}>
                    Every Corner You Love.
                  </span>
                </h1>
                <h2 className="text-secondary fw-medium font-dm-sans mb-0" style={{ fontSize: "clamp(1.125rem, 2vw, 1.5rem)", lineHeight: 1.2 }}>
                  where quality, style, and your vision all come together.
                </h2>
              </div>
            </div>

            <a
              className="d-flex justify-content-center align-items-center gap-2 bg-brown text-decoration-none"
              style={{ width: "195px", padding: "1.25rem 2.25rem", borderRadius: "40px" }}
              href="/"
            >
              <h1 className="font-dm-sans text-white text-center fw-bold mb-0" style={{ fontSize: "18px", lineHeight: "18px" }}>
                Explore
              </h1>
              <img
                style={{ width: "18px", height: "18px" }}
                src="./assets/Arrow Right.png"
                alt="ArrowRight"
                loading="lazy"
                decoding="async"
              />
            </a>
          </section>

          {/* Product Details overlay - bottom right */}
          <section className="d-none d-sm-inline-flex flex-column align-items-end gap-2 position-absolute" style={{ bottom: "2.5rem", right: "2rem" }}>
            <h1 className="text-black text-end fw-semibold font-dm-sans mb-0" style={{ fontSize: "22px", lineHeight: 1.1 }}>
              H&D Flower Lamp
            </h1>
            <div className="d-flex align-items-center gap-4">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  paddingRight: "6px",
                  paddingLeft: "12px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  borderRadius: "100px",
                  backgroundColor: "rgba(255,255,255,0.25)",
                }}
              >
                <h2 className="font-dm-sans text-orange-400 fw-bolder mb-0" style={{ fontSize: "14px", lineHeight: 1.1 }}>
                  -20%
                </h2>
              </div>
              <h1 className="text-black text-end font-dm-sans fw-bolder mb-0" style={{ fontSize: "1.875rem", lineHeight: 1.2 }}>
                199.99$
              </h1>
            </div>
          </section>
        </section>

        {/* Why Choosing Us */}
        <section className="d-flex w-100 justify-content-center bg-brown px-4 py-5" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="d-flex w-100 flex-column flex-md-row align-items-start gap-5" style={{ maxWidth: "1220px" }}>
            <h1 className="flex-shrink-0 text-white font-dm-sans fw-bold mb-0" style={{ fontSize: "40px", lineHeight: 1.25 }}>
              <span className="d-block">Why</span>
              Choosing Us
            </h1>

            <div className="d-flex flex-column flex-sm-row flex-wrap justify-content-center align-items-start gap-4 flex-grow-1" style={{ gap: "60px" }}>
              <div className="d-flex flex-column justify-content-center align-items-start gap-3">
                <h1 className="text-white font-dm-sans fw-bold mb-0" style={{ fontSize: "28px", letterSpacing: "0.4px" }}>
                  Unique facilities
                </h1>
                <h2 className="text-white font-dm-sans fs-dm-base fw-normal mb-0" style={{ maxWidth: "240px" }}>
                  Furnitech offers personalized recommendations, easy checkout,
                  and top-tier customer support to ensure a seamless shopping
                  experience.
                </h2>
              </div>

              <div className="d-flex flex-column justify-content-center align-items-start gap-3">
                <h1 className="text-white fw-bold mb-0" style={{ fontSize: "28px", letterSpacing: "0.4px" }}>
                  Affordable Price
                </h1>
                <h2 className="text-white font-dm-sans fs-dm-base fw-normal mb-0" style={{ maxWidth: "240px" }}>
                  We provide high-quality products at competitive prices, with
                  clear pricing and regular promotions to offer great value.
                </h2>
              </div>

              <div className="d-flex flex-column justify-content-center align-items-start gap-3">
                <h1 className="text-white font-dm-sans fw-bold mb-0" style={{ fontSize: "28px", letterSpacing: "0.4px" }}>
                  Wide Choices
                </h1>
                <h2 className="text-white font-dm-sans fs-dm-base fw-normal mb-0" style={{ maxWidth: "240px" }}>
                  Explore our wide range of furniture and home decor, updated
                  regularly to meet every style and need.
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 2 */}
        <section className="d-flex flex-column justify-content-center align-items-center">
          {/* Categories By Spaces */}
          <Container
            className="d-flex flex-column align-items-center gap-5 px-4"
            style={{ maxWidth: "1220px", paddingTop: "80px" }}
          >
            {/* Header */}
            <div className="w-100 d-flex flex-column align-items-center gap-4" style={{ maxWidth: "850px" }}>
              <h1 className="w-100 text-black text-center font-dm-sans fw-bold mb-0" style={{ fontSize: "clamp(2.25rem, 5vw, 56px)", lineHeight: 1.25 }}>
                Beautiful Spaces That{" "}
                <span className="d-block">
                  <span className="text-orange-400 font-dm-sans fw-bold" style={{ fontSize: "clamp(2.25rem, 5vw, 56px)", lineHeight: 1.25 }}>
                    Inspire
                  </span>{" "}
                  Every Moment
                </span>
              </h1>

              <p className="w-100 text-neutral-text-gray text-center font-dm-sans fw-normal mb-0" style={{ maxWidth: "614px", lineHeight: 1.5 }}>
                Discover furniture crafted to transform every room into a space{" "}
                <span className="d-block">
                  that inspires, comforts, and reflects your unique style.
                </span>
              </p>
            </div>

            {/* Room cards */}
            <Row className="w-100 g-4">
              {[
                { src: "./assets/C1.svg", title: "Living Room Comfort", desc: "Transform your living room into the heart of your home with stylish, cozy furniture that invites relaxation and connection." },
                { src: "./assets/C2.svg", title: "Bedroom Bliss", desc: "Create a peaceful retreat with pieces that bring warmth, comfort, and style to your personal sanctuary." },
                { src: "./assets/C3.svg", title: "Workplace Essentials", desc: "Design a workspace that enhances productivity and creativity, with furniture that's functional, stylish, and tailored to your needs." },
                { src: "./assets/C4.svg", title: "Dining Delights", desc: "Enhance your dining experience with furniture that elegance, functionality, and comfort, perfect for every meal and gathering." },
              ].map((card) => (
                <Col key={card.title} xs={12} sm={6} lg={3}>
                  <div className="rounded-4 p-3 d-flex flex-column align-items-start gap-3 h-100">
                    <img
                      src={card.src}
                      alt={card.title}
                      className="w-100 bg-lightgray"
                      style={{ height: "220px", borderRadius: "10px", objectFit: "cover" }}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="d-flex flex-column align-items-start gap-2 w-100">
                      <h1 className="w-100 text-black font-dm-sans fw-bold mb-0" style={{ fontSize: "20px", lineHeight: "20px" }}>
                        {card.title}
                      </h1>
                      <h2 className="w-100 text-gray font-dm-sans fw-normal mb-0" style={{ fontSize: "18px", lineHeight: "30px" }}>
                        {card.desc}
                      </h2>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>

          {/* Recommended */}
          <Container className="d-flex flex-column gap-5 px-4" style={{ maxWidth: "1220px", paddingTop: "80px", paddingBottom: "80px" }}>
            <div className="d-flex flex-column gap-3" style={{ maxWidth: "600px" }}>
              <h2 className="fw-bold text-heading-black mb-0" style={{ fontSize: "clamp(2.25rem, 5vw, 56px)", lineHeight: 1.2 }}>
                Recommended{" "}
                <span className="text-orange-500">For You</span>
              </h2>
              <p className="text-neutral-text-gray fs-4 mb-0" style={{ lineHeight: 1.6 }}>
                Explore our handpicked selections crafted to match your style and elevate every corner of your home.
              </p>
            </div>

            <div className="d-flex flex-column gap-4">
              {/* Tab Bar */}
              <div className="d-flex flex-wrap border-bottom border-brown-600">
                {["Furniture", "Decoration", "Storage", "Lighting"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 px-md-4 py-2 fs-6 fw-semibold border-0 bg-transparent ${
                      activeTab === tab ? "text-orange-500" : "text-brown-1000"
                    }`}
                    style={{
                      marginBottom: "-1px",
                      borderBottom: activeTab === tab ? "2px solid #d74800" : "2px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <Row className="g-4">
                {products
                  .filter((p) => p.categoryName === activeTab)
                  .map((product) => (
                    <Col key={product.id} xs={12} sm={6} lg={3}>
                      <div
                        className="d-flex flex-column rounded-4 bg-white border border-brown-600 overflow-hidden h-100 product-card-hover"
                      >
                        <div className="position-relative d-flex align-items-center justify-content-center overflow-hidden bg-brown-300 p-4" style={{ height: "220px" }}>
                          {product.isDiscountActive && (
                            <span className="position-absolute bg-orange-500 text-white fw-bold rounded-pill px-2 py-1" style={{ bottom: "0.5rem", right: "0.5rem", fontSize: "0.75rem" }}>
                              -{product.discountPercent}%
                            </span>
                          )}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="position-relative h-100 w-100 product-card-hover-img"
                            style={{ objectFit: "contain" }}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="d-flex flex-column gap-3 p-4">
                          <div className="d-flex flex-column gap-1">
                            <span className="text-brown-900 fw-semibold text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>{product.categoryName}</span>
                            <h3 className="text-heading-black fw-semibold mb-0" style={{ fontSize: "22px", lineHeight: 1.2 }}>{product.name}</h3>
                            <p
                              className="text-neutral-text-gray mb-0"
                              style={{
                                fontSize: "13px",
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical" as const,
                                overflow: "hidden",
                              }}
                            >
                              {product.description}
                            </p>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <img
                                key={`${product.id}-star-${i}`}
                                src="./assets/star.svg"
                                alt="star"
                                style={{ width: "1rem", height: "1rem" }}
                                loading="lazy"
                                decoding="async"
                              />
                            ))}
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="d-flex align-items-baseline gap-2">
                              {product.isDiscountActive ? (
                                <>
                                  <span className="text-heading-black fw-bold" style={{ fontSize: "22px" }}>
                                    <span className="fw-normal" style={{ fontSize: "14px", marginRight: "0.125rem" }}>$</span>
                                    {(product.price * (1 - product.discountPercent / 100)).toFixed(2)}
                                  </span>
                                  <span className="text-neutral-text-gray text-decoration-line-through" style={{ fontSize: "13px" }}>
                                    ${product.price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-heading-black fw-bold" style={{ fontSize: "22px" }}>
                                  <span className="fw-normal" style={{ fontSize: "14px", marginRight: "0.125rem" }}>$</span>
                                  {product.price.toLocaleString()}
                                </span>
                              )}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product.id);
                              }}
                              className="rounded-circle bg-heading-black d-flex align-items-center justify-content-center border-0"
                              style={{ width: "2.75rem", height: "2.75rem", transition: "background-color 0.3s" }}
                            >
                              <svg style={{ width: "1.25rem", height: "1.25rem" }} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
              </Row>
            </div>

            {/* CTA */}
            <a href="/" aria-label="More Information">
              <img src="./assets/CTA.webp" alt="Browse all products" className="w-100" loading="lazy" decoding="async" />
            </a>
          </Container>

          {/* Shop with Confidence */}
          <Container
            className="d-flex flex-column justify-content-center align-items-center px-4"
            style={{ maxWidth: "1220px", paddingTop: "80px", paddingBottom: "80px", gap: "60px" }}
          >
            <div className="d-flex flex-column align-items-center gap-3 text-center">
              <h1 className="text-black font-dm-sans fw-bold mb-0" style={{ fontSize: "clamp(2.25rem, 5vw, 56px)", lineHeight: 1.25 }}>
                Shop with{" "}
                <span className="text-orange-500 font-dm-sans fw-bold">Confidence</span>
              </h1>
              <h2 className="w-100 text-neutral-text-gray text-center font-dm-sans fw-normal mb-0" style={{ maxWidth: "700px", fontSize: "clamp(18px, 2vw, 20px)", lineHeight: "30px" }}>
                Experience peace of mind with our warranty, easy returns, and
                flexible payment plans—crafted to ensure a seamless shopping
                experience from start to finish.
              </h2>
            </div>

            <div className="d-flex flex-column flex-md-row align-items-start justify-content-center gap-4 w-100">
              {[
                { icon: "./assets/Tick.svg", title: "Warranty Coverage", desc: "Any manufacturing defects in materials or craftsmanship? We'll take care of it. Just contact our support team, and we'll handle the rest, ensuring your furniture stays in top shape." },
                { icon: "./assets/Circle.svg", title: "Returns & Exchanges", desc: "We understand that sometimes things don't work out. If your new piece doesn't meet your expectations, take advantage of our 30-day return policy for a full refund or exchange." },
                { icon: "./assets/Packet.svg", title: "Flexible Payment", desc: "we offer flexible payment plans, including interest-free installments over 3, 6, or 12 months. With all major credit cards and digital wallets accepted, you can choose the option that best fits your budget." },
              ].map((feature) => (
                <div key={feature.title} className="d-flex flex-column align-items-center gap-3 w-100 mx-auto" style={{ maxWidth: "364px" }}>
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    style={{ width: "160px", height: "160px" }}
                    loading="lazy"
                    decoding="async"
                  />
                  <h1 className="w-100 text-black text-center font-dm-sans fw-bold mb-0" style={{ fontSize: "28px", lineHeight: "38px" }}>
                    {feature.title}
                  </h1>
                  <h2 className="w-100 text-neutral-text-gray text-center font-dm-sans fw-normal mb-0" style={{ fontSize: "18px", lineHeight: "30px" }}>
                    {feature.desc}
                  </h2>
                </div>
              ))}
            </div>
          </Container>

          {/* FAQ */}
          <Container
            className="d-flex flex-column align-items-center gap-5 px-4"
            style={{ maxWidth: "1010px", paddingTop: "80px", paddingBottom: "80px" }}
          >
            <div className="w-100 d-flex flex-column align-items-start gap-3" style={{ maxWidth: "716px" }}>
              <h1 className="w-100 text-black font-dm-sans fw-semibold mb-0" style={{ fontSize: "clamp(2.25rem, 5vw, 56px)", lineHeight: 1.25 }}>
                Frequently Asked Questions
              </h1>
              <h2 className="w-100 text-neutral-text-gray text-center font-dm-sans fw-normal mb-0" style={{ fontSize: "clamp(18px, 2vw, 20px)", lineHeight: "30px" }}>
                Lorem ipsum dolor sit amet consectetur adipiscing elit aenean id
                volutpat imperdiet quis at pellentesque nunc commodo nunc purus
                pulvinar nisi fusce.
              </h2>
            </div>

            <div className="d-flex flex-column align-items-start gap-4 w-100">
              {[
                { q: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit id venenatis pretium risus euismod dictum egestas orci netus feugiat ut egestas ut sagittis tincidunt phasellus elit etiam cursus orci in. Id sed montes." },
                { q: "Lorem ipsum dolor sit amet, sed do eiusmod?", a: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                { q: "Lorem ipsum dolor sit amet, ut enim ad minim?", a: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident." },
              ].map((item, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-start w-100 rounded-3 border border-brown-600 gap-3 p-4 p-md-5"
                >
                  <div className="d-flex flex-column align-items-start gap-3 flex-grow-1">
                    <h1 className="w-100 text-black font-dm-sans fw-semibold mb-0" style={{ fontSize: "clamp(22px, 3vw, 28px)", lineHeight: 1.35 }}>
                      {item.q}
                    </h1>
                    {item.a && openFaqs.has(index) && (
                      <h2 className="text-neutral-text-gray font-dm-sans fw-normal mb-0" style={{ fontSize: "18px", lineHeight: "30px" }}>
                        {item.a}
                      </h2>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-expanded={openFaqs.has(index)}
                    aria-label="Toggle answer"
                    onClick={() => toggleFaq(index)}
                    className="flex-shrink-0 text-brown-1000 bg-transparent border-0"
                    style={{ marginTop: "0.25rem", transition: "color 0.2s" }}
                  >
                    <svg
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        transition: "transform 0.3s",
                        transform: openFaqs.has(index) ? "rotate(180deg)" : undefined,
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </section>
    </>
  );
}

export default LandingPage;
