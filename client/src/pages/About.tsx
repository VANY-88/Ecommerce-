import React from "react";

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
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    title: "Customer First",
    desc: "Every feature we build starts by asking what creates the best experience for our shoppers.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Quality Craft",
    desc: "We sweat the details so our users never have to. Great products are built with care.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="min-h-screen bg-brown-500 font-sans">

      {/* Hero */}
      <section className="relative overflow-hidden bg-brown pt-32 pb-28 px-6 text-center">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 60%, #FF7029 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D74800 0%, transparent 45%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <span className="inline-block text-orange-400 text-sm font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-orange-500 border-opacity-40">
            About Us
          </span>
          <h1 className="text-display-2 font-bold text-white leading-tight">
            Built by one,<br />
            <span className="text-orange-400">loved by thousands</span>
          </h1>
          <p className="text-brown-700 text-xl leading-relaxed">
            WEB-SHOP started as a passion project — one developer who believed
            online shopping could be simpler, faster, and actually enjoyable.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-brown-600">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-brown-600">
          {stats.map((stat) => (
            <div key={stat.label} className="py-10 text-center">
              <p className="text-display-3 font-bold text-orange-500">{stat.value}</p>
              <p className="text-brown-1000 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-5">
          <h2 className="text-display-3 font-bold text-heading-black">
            Why we built<br />
            <span className="text-orange-500">this shop</span>
          </h2>
          <p className="text-brown-1000 text-dm-base leading-relaxed">
            We were tired of online stores that were slow, cluttered, and hard to trust.
            So we built WEB-SHOP — a store we'd actually want to use ourselves.
          </p>
          <p className="text-brown-1000 text-dm-base leading-relaxed">
            From the first commit to the latest deploy, every decision has been made
            with one goal: make shopping simpler and more human.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="flex gap-4 bg-white rounded-2xl p-5 border border-brown-600 hover:border-orange-500 transition-colors duration-200 shadow-custom"
            >
              <div className="flex-shrink-0 w-11 h-11 bg-orange-500 bg-opacity-10 rounded-xl flex items-center justify-center text-orange-500">
                {v.icon}
              </div>
              <div>
                <h3 className="font-semibold text-heading-black">{v.title}</h3>
                <p className="text-brown-1000 text-sm leading-relaxed mt-0.5">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-display-3 font-bold text-heading-black">
              Meet the <span className="text-orange-500">founder</span>
            </h2>
            <p className="text-brown-1000 text-dm-base">
              One person, one shared vision — build something people love.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="group flex flex-col items-center text-center bg-brown-400 rounded-3xl p-10 border border-brown-600 hover:border-orange-500 hover:shadow-custom transition-all duration-300 w-full max-w-sm"
              >
                <div className="relative mb-6">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-28 h-28 rounded-2xl object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <h3 className="text-display-4 font-bold text-heading-black">{member.name}</h3>
                <p className="text-orange-500 font-medium text-sm mt-1">{member.role}</p>
                <p className="text-brown-1000 text-sm leading-relaxed mt-4">{member.description}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-white text-heading-black text-xs font-medium px-3 py-1 rounded-full border border-brown-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center space-y-6">
        <h2 className="text-display-3 font-bold text-heading-black">
          Ready to explore?
        </h2>
        <p className="text-brown-1000 text-dm-base max-w-sm mx-auto">
          Browse hundreds of products curated for quality and value.
        </p>
        <a
          href="/"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold px-10 py-4 rounded-2xl transition-colors duration-200 text-lg"
        >
          Start Shopping
        </a>
      </section>
    </div>
  );
}

export default About;
