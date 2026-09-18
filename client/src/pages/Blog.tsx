import React from "react";
import Container from "react-bootstrap/Container";

function Blog() {
  return (
    <div className="min-vh-100 bg-brown-500 px-4 px-md-5 py-5 d-flex align-items-center" style={{ paddingBottom: "120px" }}>
      <Container style={{ maxWidth: "896px" }}>
        <h1 className="fs-display-3 text-heading-black fw-bold text-center mb-4">
          Style Your Home <br /> with Expert Furniture Tips and Ideas
        </h1>
        <p className="text-center text-secondary fs-4 mb-0">
          Our blog is coming soon — check back for furniture care guides, styling tips, and product updates.
        </p>
      </Container>
    </div>
  );
}

export default Blog;
