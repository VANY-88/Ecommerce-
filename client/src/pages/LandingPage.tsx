import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
      <section className="w-full h-auto bg-brown-400 bg-center">
        {/* Hero Section */}
        <section
          className="relative w-full bg-cover bg-center h-screen flex items-center"
          style={{ backgroundImage: `url('./assets/Container.webp')` }}
        >
          {/* Hero card */}
          <section
            className="
              hero flex flex-col justify-center items-start font-DM gap-6 lg:gap-10
              w-[calc(100%-2rem)] sm:w-[80%] md:w-auto md:max-w-[868px]
              p-6 sm:p-10 lg:p-[60px]
              mx-4 sm:mx-8 lg:ml-[max(5vw,calc(50vw-434px))]
              rounded-[40px] border border-[rgba(255,255,255,0.30)]
              bg-gradient-to-r from-[rgba(255,255,255,0.10)] via-[rgba(255,255,255,0.30)] to-[rgba(255,255,255,0.60)]
              backdrop-blur-[16px]
            "
          >
            <div className="flex flex-col items-start gap-4 self-stretch">
              <div className="flex flex-col items-start gap-4">
                <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-sans font-bold leading-[1.1] text-orange-500">
                  Perfect Pieces{" "}
                  <span className="text-heading-black text-4xl sm:text-5xl lg:text-[68px] font-dm-sans font-bold leading-[110%]">
                    for
                  </span>
                  <span className="flex text-heading-black text-4xl sm:text-5xl lg:text-[68px] font-dm-sans font-bold leading-[110%]">
                    Every Corner You Love.
                  </span>
                </h1>
                <h2 className="text-neutral-500 font-medium text-lg lg:text-2xl leading-[1.2] font-dm-san">
                  where quality, style, and your vision all come together.
                </h2>
              </div>
            </div>

            <a
              className="flex w-[195px] px-9 py-5 lg:py-6 justify-center items-center gap-2 bg-brown rounded-[40px]"
              href="/"
            >
              <h1 className="font-DM Sans text-white text-center text-[18px] font-bold leading-[18px]">
                Explore
              </h1>
              <img
                className="flex w-[18px] h-[18px] px-[2.654px] py-[2.25px] justify-center items-center shrink-0"
                src="./assets/Arrow Right.png"
                alt="ArrowRight"
                loading="lazy"
                decoding="async"
              />
            </a>
          </section>

          {/* Product Details overlay - bottom right */}
          <section className="hidden sm:inline-flex flex-col items-end gap-2 absolute bottom-10 right-8">
            <h1 className="text-black text-right text-[22px] font-semibold leading-[1.1] font-DM Sans">
              H&D Flower Lamp
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex pr-[6px] pl-[12px] justify-center items-center gap-[10px] rounded-[100px] bg-white/25">
                <h2 className="text-[14px] font-DM Sans text-orange-400 font-extrabold leading-[1.1]">
                  -20%
                </h2>
              </div>
              <h1 className="text-black text-right font-dm-sans text-3xl font-extrabold leading-tight">
                199.99$
              </h1>
            </div>
          </section>
        </section>

        {/* Why Choosing Us */}
        <section className="flex w-full py-12 md:py-[80px] px-4 justify-center bg-brown">
          <div className="flex w-full max-w-[1220px] flex-col md:flex-row items-start gap-10 md:gap-[92px]">
            <h1 className="shrink-0 text-white font-DM Sans text-[36px] md:text-[40px] font-bold leading-[1.25]">
              <span className="block">Why</span>
              Choosing Us
            </h1>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-start gap-8 md:gap-[60px] flex-1">
              <div className="flex flex-col justify-center items-start gap-4">
                <h1 className="text-white font-DM Sans text-[24px] md:text-[28px] font-bold leading-normal tracking-[0.4px]">
                  Unique facilities
                </h1>
                <h2 className="w-full max-w-[240px] text-white font-DM Sans text-dm-base font-normal">
                  Furnitech offers personalized recommendations, easy checkout,
                  and top-tier customer support to ensure a seamless shopping
                  experience.
                </h2>
              </div>

              <div className="flex flex-col justify-center items-start gap-4">
                <h1 className="text-white text-[24px] md:text-[28px] font-bold leading-normal tracking-[0.4px]">
                  Affordable Price
                </h1>
                <h2 className="w-full max-w-[240px] text-white font-DM Sans text-dm-base font-normal">
                  We provide high-quality products at competitive prices, with
                  clear pricing and regular promotions to offer great value.
                </h2>
              </div>

              <div className="flex flex-col justify-center items-start gap-4">
                <h1 className="text-white font-DM Sans text-[24px] md:text-[28px] font-bold leading-normal tracking-[0.4px]">
                  Wide Choices
                </h1>
                <h2 className="w-full max-w-[240px] text-white font-DM Sans text-dm-base font-normal">
                  Explore our wide range of furniture and home decor, updated
                  regularly to meet every style and need.
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 2 */}
        <section className="flex flex-col justify-center items-center">
          {/* Categories By Spaces */}
          <section className="w-full max-w-[1220px] mx-auto px-4 pt-[80px] lg:pt-[140px] flex flex-col items-center gap-12 lg:gap-20">
            {/* Header */}
            <div className="w-full max-w-[850px] flex flex-col items-center gap-6">
              <h1 className="self-stretch text-black text-center font-DM Sans text-4xl md:text-[56px] font-bold leading-[125%]">
                Beautiful Spaces That{" "}
                <span className="block">
                  <span className="text-orange-400 font-DM Sans text-4xl md:text-[56px] font-bold leading-[125%]">
                    Inspire
                  </span>{" "}
                  Every Moment
                </span>
              </h1>

              <p className="w-full max-w-[614px] text-neutral-text-gray text-center font-DM Sans text-base font-normal leading-[150%]">
                Discover furniture crafted to transform every room into a space{" "}
                <span className="block">
                  that inspires, comforts, and reflects your unique style.
                </span>
              </p>
            </div>

            {/* Room cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 self-stretch">
              {[
                { src: "./assets/C1.svg", title: "Living Room Comfort", desc: "Transform your living room into the heart of your home with stylish, cozy furniture that invites relaxation and connection." },
                { src: "./assets/C2.svg", title: "Bedroom Bliss", desc: "Create a peaceful retreat with pieces that bring warmth, comfort, and style to your personal sanctuary." },
                { src: "./assets/C3.svg", title: "Workplace Essentials", desc: "Design a workspace that enhances productivity and creativity, with furniture that's functional, stylish, and tailored to your needs." },
                { src: "./assets/C4.svg", title: "Dining Delights", desc: "Enhance your dining experience with furniture that elegance, functionality, and comfort, perfect for every meal and gathering." },
              ].map((card) => (
                <div key={card.title} className="group rounded-2xl transition-all duration-300 hover:shadow-lg flex p-4 flex-col items-start gap-6">
                  <img
                    src={card.src}
                    alt={card.title}
                    className="h-[220px] self-stretch rounded-[10px] bg-lightgray bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex flex-col items-start gap-3 self-stretch">
                    <h1 className="self-stretch text-black font-DM Sans text-[20px] font-bold leading-5">
                      {card.title}
                    </h1>
                    <h2 className="self-stretch text-gray font-DM Sans text-[18px] font-normal leading-[30px]">
                      {card.desc}
                    </h2>
                  </div>
                </div>
              ))}
            </section>
          </section>

          {/* Recommended */}
          <section className="w-full max-w-[1220px] mx-auto px-4 py-[80px] lg:py-[140px] flex flex-col gap-16">
            <div className="flex flex-col gap-4 max-w-[600px]">
              <h2 className="text-4xl md:text-[56px] font-bold leading-[1.2] text-heading-black">
                Recommended{" "}
                <span className="text-orange-500">For You</span>
              </h2>
              <p className="text-neutral-text-gray text-xl leading-relaxed">
                Explore our handpicked selections crafted to match your style and elevate every corner of your home.
              </p>
            </div>

            <div className="flex flex-col gap-10">
              {/* Tab Bar */}
              <div className="flex flex-wrap border-b border-brown-600">
                {["Furniture", "Decoration", "Storage", "Lighting"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 md:px-6 py-3 text-base font-semibold -mb-px border-b-2 transition-all duration-200 ${
                      activeTab === tab
                        ? "border-orange-500 text-orange-500"
                        : "border-transparent text-brown-1000 hover:text-heading-black hover:border-brown-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter((p) => p.categoryName === activeTab)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="group flex flex-col rounded-2xl bg-white border border-brown-600 overflow-hidden hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative h-[220px] bg-brown-300 flex items-center justify-center p-6 overflow-hidden">
                        {product.isDiscountActive && (
                          <span className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{product.discountPercent}%
                          </span>
                        )}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="relative h-full w-full object-contain group-hover:-translate-y-6 group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex flex-col gap-4 p-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-brown-900 text-[11px] font-semibold uppercase tracking-widest">{product.categoryName}</span>
                          <h3 className="text-heading-black text-[22px] font-semibold leading-tight">{product.name}</h3>
                          <p className="text-neutral-text-gray text-[13px] leading-normal line-clamp-2">{product.description}</p>
                        </div>
                        <div className="flex items-center gap-[3px]">
                          {[...Array(5)].map((_, i) => (
                            <img
                              key={`${product.id}-star-${i}`}
                              src="./assets/star.svg"
                              alt="star"
                              className="w-4 h-4"
                              loading="lazy"
                              decoding="async"
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-baseline gap-2">
                            {product.isDiscountActive ? (
                              <>
                                <span className="text-heading-black font-bold text-[22px]">
                                  <span className="text-[14px] font-normal mr-0.5">$</span>
                                  {(product.price * (1 - product.discountPercent / 100)).toFixed(2)}
                                </span>
                                <span className="text-neutral-text-gray text-[13px] line-through">
                                  ${product.price.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-heading-black font-bold text-[22px]">
                                <span className="text-[14px] font-normal mr-0.5">$</span>
                                {product.price.toLocaleString()}
                              </span>
                            )}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product.id);
                            }}
                            className="w-11 h-11 rounded-full bg-heading-black flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* CTA */}
            <a href="/" aria-label="More Information">
              <img src="./assets/CTA.webp" alt="Browse all products" className="w-full" loading="lazy" decoding="async" />
            </a>
          </section>

          {/* Shop with Confidence */}
          <section className="w-full max-w-[1220px] mx-auto px-4 py-[80px] lg:py-[140px] flex flex-col justify-center items-center gap-[60px] md:gap-[80px]">
            <div className="flex flex-col items-center gap-[23px] text-center">
              <h1 className="text-black font-DM Sans text-4xl md:text-[56px] font-bold leading-[1.25]">
                Shop with{" "}
                <span className="text-orange-500 font-DM Sans font-bold">Confidence</span>
              </h1>
              <h2 className="w-full max-w-[700px] text-neutral-text-gray text-center font-DM Sans text-[18px] md:text-[20px] font-normal leading-[30px]">
                Experience peace of mind with our warranty, easy returns, and
                flexible payment plans—crafted to ensure a seamless shopping
                experience from start to finish.
              </h2>
            </div>

            <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-7 w-full">
              {[
                { icon: "./assets/Tick.svg", title: "Warranty Coverage", desc: "Any manufacturing defects in materials or craftsmanship? We'll take care of it. Just contact our support team, and we'll handle the rest, ensuring your furniture stays in top shape." },
                { icon: "./assets/Circle.svg", title: "Returns & Exchanges", desc: "We understand that sometimes things don't work out. If your new piece doesn't meet your expectations, take advantage of our 30-day return policy for a full refund or exchange." },
                { icon: "./assets/Packet.svg", title: "Flexible Payment", desc: "we offer flexible payment plans, including interest-free installments over 3, 6, or 12 months. With all major credit cards and digital wallets accepted, you can choose the option that best fits your budget." },
              ].map((feature) => (
                <div key={feature.title} className="flex flex-col items-center gap-5 w-full max-w-[364px] mx-auto">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-[140px] h-[140px] md:w-[160px] md:h-[160px]"
                    loading="lazy"
                    decoding="async"
                  />
                  <h1 className="self-stretch text-black text-center font-DM Sans text-[24px] md:text-[28px] font-bold leading-[38px]">
                    {feature.title}
                  </h1>
                  <h2 className="self-stretch text-neutral-text-gray text-center font-DM Sans text-[18px] font-normal leading-[30px]">
                    {feature.desc}
                  </h2>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="w-full max-w-[1010px] mx-auto px-4 py-[80px] lg:py-[140px] flex flex-col items-center gap-12 md:gap-20">
            <div className="w-full max-w-[716px] flex flex-col items-start gap-6">
              <h1 className="self-stretch text-black font-DM Sans text-4xl md:text-[56px] font-semibold leading-[1.25]">
                Frequently Asked Questions
              </h1>
              <h2 className="self-stretch text-neutral-text-gray text-center font-DM Sans text-[18px] md:text-[20px] font-normal leading-[30px]">
                Lorem ipsum dolor sit amet consectetur adipiscing elit aenean id
                volutpat imperdiet quis at pellentesque nunc commodo nunc purus
                pulvinar nisi fusce.
              </h2>
            </div>

            <div className="flex flex-col items-start gap-6 self-stretch">
              {[
                { q: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit id venenatis pretium risus euismod dictum egestas orci netus feugiat ut egestas ut sagittis tincidunt phasellus elit etiam cursus orci in. Id sed montes." },
                { q: "Lorem ipsum dolor sit amet, sed do eiusmod?", a: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                { q: "Lorem ipsum dolor sit amet, ut enim ad minim?", a: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident." },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex p-6 md:p-12 justify-between items-start self-stretch rounded-lg border border-gray-400 gap-4"
                >
                  <div className="flex flex-col items-start gap-4 flex-1">
                    <h1 className="self-stretch text-black font-DM Sans text-[22px] md:text-[28px] font-semibold leading-[1.35]">
                      {item.q}
                    </h1>
                    {item.a && openFaqs.has(index) && (
                      <h2 className="text-neutral-text-gray font-DM Sans text-[18px] font-normal leading-[30px]">
                        {item.a}
                      </h2>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-expanded={openFaqs.has(index)}
                    aria-label="Toggle answer"
                    onClick={() => toggleFaq(index)}
                    className="shrink-0 mt-1 text-brown-1000 hover:text-orange-500 transition-colors duration-200"
                  >
                    <svg
                      className={`w-6 h-6 transition-transform duration-300 ${openFaqs.has(index) ? "rotate-180" : ""}`}
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
          </section>
        </section>
      </section>
    </>
  );
}

export default LandingPage;
